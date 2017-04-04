import * as ts from 'typescript';
import { Mutator } from './Mutator';

// TODO: declaration merging with all declarations
export class InterfaceDeclarationMutator extends Mutator {

  protected kind = ts.SyntaxKind.InterfaceDeclaration;

  private processed: ts.Symbol[] = [];

  public mutate(node: ts.InterfaceDeclaration): ts.Node {
    // TODO: get all declarations, merge (including extends), add to processed,
    // replace future mutations simply with IFace = IFace or remove it completely.
    //
    // const sym = this.context.checker.getSymbolAtLocation(node.name);
    // console.log(sym.getName());
    // console.log(sym.getDeclarations().length);
    // console.log(ts.SyntaxKind[sym.declarations[0].kind]);
    //
    // sym.declarations.forEach(dec => {
    //   const s = this.context.checker.getSymbolAtLocation(dec.name)
    //   console.log(sym === s);
    // })
    //
    // console.log();

    const nodeSymbol = this.context.checker.getSymbolAtLocation(node.name);

    // TODO: remove node entirely (return null)
    if (this.processed.indexOf(nodeSymbol) !== -1) {
      return null;
      // const reassignment = ts.createStatement(ts.createBinary(
      //   ts.createIdentifier(node.name.getText()),
      //   ts.createToken(ts.SyntaxKind.EqualsToken),
      //   ts.createIdentifier(node.name.getText())
      // ));
      //
      // this.context.addVisited(reassignment, true);
      // return reassignment;
    }

    let typeAliasExpressions: ts.Expression = this.factory.asObject(
      this.factory.typeElementsReflection(
        this.mergeDeclarations(nodeSymbol)/*node.members*/, true
      )
    );

    if (this.context.hasSelfReference(node)) {
      typeAliasExpressions = this.factory.selfReference(node.name, typeAliasExpressions);
    }

    const intersections = this.mergeExtendsClauses(nodeSymbol);

    if (intersections.length >= 1) {
      (intersections as ts.Expression[]).push(typeAliasExpressions)
      typeAliasExpressions = this.factory.intersect(intersections);
    }

    const substitution = ts.createVariableStatement(
      node.modifiers,
      ts.createVariableDeclarationList(
        [
          ts.createVariableDeclaration(
            node.name,
            undefined,
            this.factory.interfaceSubstitution(node.name, typeAliasExpressions)
          )
        ],
        ts.NodeFlags.Const
      )
    );

    this.context.addVisited(substitution, true);
    this.processed.push(nodeSymbol);

    return substitution;
  }

  private getExtendsClause(node: ts.InterfaceDeclaration): ts.HeritageClause {
    return node.heritageClauses && node.heritageClauses.find(clause => {
      if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
        return true;
      }
    })
  }

  private mergeExtendsClauses(nodeSymbol: ts.Symbol): ts.Expression[] {
    const existing: string[] = [];
    const expressions: ts.Expression[] = [];

    for (let declaration of (nodeSymbol.getDeclarations() || []) as ts.InterfaceDeclaration[]) {
      const extendsClause = this.getExtendsClause(declaration);
      const intersections = extendsClause && extendsClause.types && extendsClause.types
        .map(expr => {
          existing.push(expr.expression.getText());
          return expr.expression;
        })
        .filter(expr => {
          return existing.indexOf(expr.getText()) !== -1;
        });

      if (intersections) {
        expressions.push(...intersections);
      }
    }

    return expressions;
  }

  private mergeDeclarations(nodeSymbol: ts.Symbol): ts.TypeElement[] {
    const existing: string[] = [];
    const merged: ts.TypeElement[] = [];

    for (let declaration of (nodeSymbol.getDeclarations() || []) as ts.InterfaceDeclaration[]) {
      declaration.members.forEach(member => {
        const text = member.getText();

        if (existing.indexOf(text) === -1) {
          existing.push(text);
          merged.push(member);
        }
      });
    }

    return merged;
  }

}

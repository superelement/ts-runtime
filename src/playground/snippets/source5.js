import { test } from './source6';
// Variable with implicit complex type
let _aType = t.nullable(t.array(t.nullable(t.number()))), a = _aType.assert(test());
// Constant with implicit complex type
const b = t.nullable(t.array(t.nullable(t.number()))).assert(test());
// Variable reassignment
a = _aType.assert(19);
// Constant with explicit any type
const c = 10;
// Variable with explicit any type
let d = 'foo';
d = 'bar';
// Variable with implicit any type
let f;
f = 'hi';
// Variable with explicit complex type
let _gType = t.nullable(t.array(t.nullable(t.ref(Symbol)))), g;
g = _gType.assert([Symbol(1), Symbol(2)]);
let _hType = t.union(t.null(), t.void()), h;
let _iType = t.nullable(t.union(t.nullable(t.number()), t.nullable(t.ref(Symbol)), t.nullable(t.array(t.nullable(t.array(t.nullable(t.boolean()))))))), i;
let _jType = t.nullable(t.void()), j;
let _kType = t.null(), k;
let _lType = t.nullable(t.symbol()), l;
let _mType = t.any(), m;
// Variable with implicit complex type
let _eType = t.nullable(t.array(t.nullable(t.union(t.nullable(t.string()), t.nullable(t.number()))))), e = _eType.assert(['one', 10, 'three']);
e = _eType.assert('hello');
let _nType = t.nullable(t.number(10)), n;
let _oType = t.nullable(t.boolean(true)), o;
let _pType = t.nullable(t.string("str")), p;
let _qType = t.nullable(t.boolean(false)), q;
let _rType = t.any(), r;
let _sType = t.any(), s = _sType.assert({});
let _tType = t.nullable(t.ref(Object)), t = _tType.assert({});
let _uType = t.nullable(t.object(t.property("x", t.nullable(t.number())))), u = _uType.assert({});
let _vType = t.nullable(t.ref(Function)), v = _vType.assert(() => { });
const AA = t.type("AA", t.nullable(t.object(t.property("x", t.nullable(t.number())))));
let _wType = t.nullable(t.array(t.nullable(t.object()))), w = _wType.assert([1, 'str', {}, Symbol(1)]);
let _xType = t.nullable(t.array(t.nullable(t.union(t.nullable(t.string()), t.nullable(t.number()))))), x = _xType.assert([1, 'str']);
let _yType = t.nullable(t.object(t.property("one", t.nullable(t.number())), t.property("two", t.nullable(t.string())))), y = _yType.assert({
    one: 1,
    two: 'str'
});
let _zType = t.nullable(t.object(t.property("one", t.nullable(t.number())), t.property("two", t.nullable(t.string())), t.property("three", t.nullable(t.symbol())))), z = _zType.assert({
    one: 1,
    two: 'str',
    three: Symbol(1)
});
let _ab1Type = t.nullable(t.union(t.nullable(t.ref(B)), t.nullable(t.intersection(t.nullable(t.ref(A)), t.nullable(t.ref(B)))))), ab1;
let _ab2Type = t.nullable(t.union(t.nullable(t.ref(A)), t.nullable(t.ref(B)))), ab2;
let _xType = t.nullable(t.object(t.indexer("index", t.nullable(t.string()), t.any()), t.property("one", t.nullable(t.number())))), x;
const IB = t.type("IB", t.nullable(t.object(t.property("one", t.nullable(t.number())), t.property("two", t.nullable(t.string())))));
const NN = t.type("NN", t.nullable(t.number()));
let _xxxxType = t.nullable(t.number()), xxxx;
class B {
}
class A extends B {
    constructor() {
        super();
        this.b = 1;
        return new CC();
    }
    static method1() {
    }
    method2(p1, p2 = true, p3) {
        return;
    }
}
A.a = 'str';
class CC extends A {
}
let _aType = t.nullable(t.function(t.param("p1", t.nullable(t.number())), t.param("p2", t.any()), t.param("p3", t.nullable(t.string()), true), t.return(t.union(t.null(), t.void())))), a;

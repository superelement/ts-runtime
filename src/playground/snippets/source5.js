import { test } from './source6';
// Variable with implicit complex type
let _aType = t.array(t.number()), a = _aType.assert(test());
// Constant with implicit complex type
const b = t.array(t.number()).assert(test());
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
let _gType = t.array(t.ref(Symbol)), g;
g = _gType.assert([Symbol(1), Symbol(2)]);
let _hType = t.union(t.void(), t.null()), h;
let _iType = t.union(t.number(), t.array(t.array(t.boolean())), t.ref(Symbol)), i;
let _jType = t.void(), j;
let _kType = t.null(), k;
let _lType = t.ref(Symbol), l;
let _mType = t.this(this), m;
// Variable with implicit complex type
let _eType = t.array(t.union(t.string(), t.number())), e = _eType.assert(['one', 10, 'three']);
e = _eType.assert('hello');
let _nType = t.number(10), n;
let _oType = t.boolean(true), o;
let _pType = t.string("str"), p;
let _qType = t.boolean(false), q;
let _nType = t.ref(o), n;
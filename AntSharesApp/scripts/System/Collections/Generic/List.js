var System;
(function (System) {
    (function (Collections) {
        (function (Generic) {
            var List = (function () {
                function List(array) {
                    var _this = this;
                    this.array = array;
                    Object.defineProperty(this, "array", { value: array, writable: false });

                    this.Add = function (item) {
                        _this.array.push(item);
                        return _this.array.ToList();
                    };

                    this.Aggregate = function (Func, seed) {
                        var a;
                        var current;

                        if ((a = _this.array).length === 0)
                            throw "Aggregate of empty array";

                        current = a[0];

                        for (var i = 1, n = a.length; i < n; ++i) {
                            current = Func(current, a[i]);
                        }

                        return current;
                    };

                    this.Any = function (Func) {
                        var a = _this.array;
                        for (var i = 0, n = a.length; i < n; ++i) {
                            if (Func(a[i])) {
                                return true;
                            }
                        }

                        return false;
                    };

                    this.All = function (Func) {
                        var a = _this.array;
                        for (var i = 0, n = a.length; i < n; ++i) {
                            if (!Func(a[i])) {
                                return false;
                            }
                        }

                        return true;
                    };

                    this.Average = function (Func) {
                        var a = _this.array;

                        Func = Func || (function (o) {
                            return o;
                        });

                        var total = 0;

                        var len = a.length;
                        for (var i = 0; i < len; ++i) {
                            total += Func(a[i]);
                        }

                        return total / len;
                    };

                    this.Concat = function (array) {
                        return new List(_this.array.concat(array));
                    };

                    this.Contains = function (item, comparer) {
                        if (!comparer)
                            return _this.Any(function (o) {
                                return o === item;
                            });

                        return _this.Any(function (o) {
                            return comparer.Equals(o, item);
                        });
                    };

                    this.Count = function (Func) {
                        if (Func)
                            return _this.Where(Func).Count();

                        return _this.array.length;
                    };

                    this.Distinct = function (comparer) {
                        return _this.DistinctBy(function (o) {
                            return o;
                        }, comparer);
                    };

                    this.DistinctBy = function (Func, comparer) {
                        var a = _this.array;
                        var e;

                        var keys = [], unique = [];

                        for (var i = 0, n = a.length; i < n; ++i) {
                            e = a[i];

                            var objKey = Func(e);

                            if (!keys.ToList().Contains(objKey, comparer)) {
                                keys.push(objKey);
                                unique.push(e);
                            }
                        }

                        return new List(unique);
                    };

                    this.ElementAt = function (index) {
                        if (index < 0 || index >= _this.array.length)
                            throw "Index was out of range. Must be non-negative and less than the size of the collection.";

                        return _this.array[index];
                    };

                    this.ElementAtOrDefault = function (index) {
                        if (index >= _this.array.length || index < 0)
                            return null;

                        return _this.array[index];
                    };

                    this.Except = function (except, comparer) {
                        var a = _this.array;

                        var result = [];
                        var hashTable = {};

                        var e, eHash;
                        var getHash = comparer ? comparer.GetHashCode : function (e) {
                            return Object.GetHashCode(e);
                        };

                        for (var i = 0, n = except.length; i < n; ++i) {
                            hashTable[getHash(except[i])] = 1;
                        }

                        for (var i = 0, n = a.length; i < n; ++i) {
                            e = a[i];
                            eHash = getHash(e);

                            if (!hashTable[eHash])
                                result.push(e);
                        }

                        return new List(result);
                    };

                    this.First = function (Func) {
                        if (_this.array.length === 0)
                            throw "Enumeration does not contain elements";

                        if (!Func)
                            return _this.array[0];

                        var result = _this.Where(Func);
                        if (result.Count() === 0)
                            throw "Enumeration does not contain elements";

                        return result.ElementAt(0);
                    };

                    this.FirstOrDefault = function (Func) {
                        if (!Func)
                            return _this.array.length > 0 ? _this.array[0] : null;

                        return _this.Where(Func).ElementAtOrDefault(0);
                    };

                    this.ForEach = function (Func) {
                        var a = _this.array;

                        for (var i = 0, n = a.length; i < n; ++i) {
                            if (Func(a[i], i) === false)
                                break;
                        }
                    };

                    this.GroupBy = function (keySelector, elementSelector, comparer) {
                        elementSelector = elementSelector || (function (o) {
                            return o;
                        });
                        comparer = comparer || {
                            Equals: function (a, b) {
                                return a == b;
                            }, GetHashCode: function (e) {
                                return Object.GetHashCode(e);
                            }
                        };

                        var a = _this.array;

                        var key, hashKey, reHashKey;
                        var hashs = {};
                        for (var i = 0, n = a.length; i < n; ++i) {
                            reHashKey = undefined;

                            key = keySelector(a[i]);
                            hashKey = comparer.GetHashCode(key);

                            if (typeof hashs[hashKey] !== "undefined")
                                reHashKey = comparer.Equals(key, hashs[hashKey].Key) ? hashKey : hashKey + i;

                            if (typeof reHashKey !== "undefined" && reHashKey !== hashKey)
                                hashKey = reHashKey;

                            hashs[hashKey] = hashs[hashKey] || { Key: key, Elements: [] };
                            hashs[hashKey].Elements.push(elementSelector(a[i]));
                        }

                        var keys = Object.keys(hashs);
                        var ret = [];
                        for (var i = 0, n = keys.length; i < n; ++i) {
                            ret.push(hashs[keys[i]]);
                        }

                        return new List(ret);
                    };

                    this.IndexOf = function (x, comparer) {
                        var a = _this.array;

                        if (comparer) {
                            for (var i = 0, n = a.length; i < n; ++i) {
                                var ce = a[i];

                                if (comparer.Equals(ce, x)) {
                                    return i;
                                }
                            }
                        } else {
                            for (var i = 0, n = a.length; i < n; ++i) {
                                if (a[i] === x) {
                                    return i;
                                }
                            }
                        }

                        return -1;
                    };

                    this.Intersect = function (array, comparer) {
                        var result = [];

                        for (var i = 0, n = array.length; i < n; ++i) {
                            if (_this.Contains(array[i], comparer)) {
                                result.push(array[i]);
                            }
                        }

                        return new List(result);
                    };

                    this.Join = function (array, outerKeySelector, innerKeySelector, resultSelector, comparer) {
                        var result = [];

                        var outer = _this.Select(outerKeySelector);
                        var inner = array.ToList().Select(innerKeySelector);

                        for (var i = 0, n = outer.Count() ; i < n; ++i) {
                            var outerKey = outer.ElementAt(i);

                            var index = -1;
                            if ((index = inner.IndexOf(outerKey, comparer)) != -1) {
                                var innerKey = inner.ElementAt(index);

                                result.push(resultSelector(outerKey, innerKey));
                            }
                        }

                        return new List(result);
                    };

                    this.Last = function (Func) {
                        if (_this.array.length === 0)
                            throw "Enumeration does not contain elements";

                        if (!Func)
                            return _this.array[_this.array.length - 1];

                        var result = _this.Where(Func);
                        if (result.Count() === 0)
                            throw "Enumeration does not contain elements";

                        return result.Last();
                    };

                    this.LastOrDefault = function (predicate) {
                        if (_this.array.length === 0)
                            return null;

                        if (!predicate)
                            return _this.array[_this.array.length - 1];

                        var result = _this.Where(predicate);
                        if (result.Count() === 0)
                            return null;

                        return result.LastOrDefault();
                    };

                    this.Max = function (Func) {
                        var a = _this.array;

                        if (a.length === 0)
                            throw "Sequence contains no elements.";

                        Func = Func || (function (o) {
                            return o;
                        });

                        var max = Func(a[0]);

                        for (var i = 0, n = a.length; i < n; ++i) {
                            var next = Func(a[i]);
                            if (next > max)
                                max = next;
                        }

                        return max;
                    };

                    this.Min = function (Func) {
                        var a = _this.array;

                        if (a.length === 0)
                            throw "Sequence contains no elements.";

                        Func = Func || (function (o) {
                            return o;
                        });

                        var min = Func(a[0]);

                        for (var i = 0, n = a.length; i < n; ++i) {
                            var next = Func(a[i]);
                            if (next < min)
                                min = next;
                        }

                        return min;
                    };

                    this.OrderBy = function (KeyFunc, comparer) {
                        comparer = comparer || (function (a, b) {
                            return a > b ? 1 : -1;
                        });

                        _this.array.sort(function (l, r) {
                            return comparer(KeyFunc(l), KeyFunc(r));
                        });
                        return _this;
                    };

                    this.OrderByDescending = function (KeyFunc, comparer) {
                        comparer = comparer || (function (a, b) {
                            return a > b ? 1 : -1;
                        });

                        comparer = (function (comparer) {
                            return function (a, b) {
                                return -comparer(a, b);
                            };
                        })(comparer);

                        _this.array.sort(function (l, r) {
                            return comparer(KeyFunc(l), KeyFunc(r));
                        });
                        return _this;
                    };

                    this.RemoveAll = function (Func) {
                        return _this.array.ToList().Where(function (x) {
                            return !Func(x);
                        });
                    };

                    this.Reverse = function () {
                        var right = _this.array.length - 1;
                        for (var left = 0; left < right; ++left, --right) {
                            var temporary = _this.array[left];
                            _this.array[left] = _this.array[right];
                            _this.array[right] = temporary;
                        }

                        return _this;
                    };

                    this.Select = function (selector) {
                        var a = _this.array;

                        var result = [];

                        for (var i = 0, n = a.length; i < n; ++i) {
                            result.push(selector(a[i]));
                        }

                        return new List(result);
                    };

                    this.SelectMany = function (selector, resultSelector) {
                        var a = _this.array;

                        var result = [];

                        for (var i = 0, n = a.length; i < n; ++i) {
                            result = result.concat(selector(a[i]));
                        }

                        if (!resultSelector)
                            return result.ToList();
                        else
                            return result.ToList().Select(resultSelector);
                    };

                    this.SequenceEqual = function (second, comparer) {
                        var a = _this.array;

                        if (typeof a === "undefined" || typeof second === "undefined") {
                            throw "Do not pass null values to arrays.";
                        }

                        if (a === second) {
                            return true;
                        }

                        if (a.length !== second.length) {
                            return false;
                        }

                        if (comparer) {
                            for (var i = 0, n = a.length; i < n; i++) {
                                if (!comparer(a[i], second[i]))
                                    return false;
                            }
                        } else {
                            for (var i = 0, n = a.length; i < n; i++) {
                                if (a[i] !== second[i])
                                    return false;
                            }
                        }

                        return true;
                    };

                    this.Single = function (predicate) {
                        var a = _this.array;

                        if (!predicate) {
                            if (a.length != 1)
                                throw "Source has none or more than one element";

                            return a[0];
                        }

                        var found = null;

                        for (var i = 0, n = a.length; i < n; ++i) {
                            if (predicate(a[i])) {
                                if (found != null)
                                    throw "Source has more than one element";

                                found = a[i];
                            }
                        }

                        return found;
                    };

                    this.SingleOrDefault = function (predicate, defaultValue) {
                        var a = _this.array;

                        if (!predicate) {
                            if (a.length != 1)
                                return defaultValue;

                            return a[0];
                        }

                        var found = null;

                        for (var i = 0, n = a.length; i < n; ++i) {
                            if (predicate(a[i])) {
                                if (found != null)
                                    return defaultValue;

                                found = a[i];
                            }
                        }

                        return found;
                    };

                    this.Skip = function (count) {
                        return new List(_this.array.slice(count));
                    };

                    this.SkipWhile = function (predicate) {
                        var a = _this.array, i = 0;

                        for (var n = a.length; i < n; ++i) {
                            if (predicate(a[i]) === false)
                                break;
                        }

                        return new List(a.slice(i));
                    };

                    this.Sum = function (selector) {
                        var a = _this.array;

                        var result = 0;

                        if (selector) {
                            for (var i = 0, n = a.length; i < n; ++i) {
                                result += selector(a[i]);
                            }
                        } else {
                            for (var i = 0, n = a.length; i < n; ++i) {
                                result += a[i];
                            }
                        }

                        return result;
                    };

                    this.Take = function (count) {
                        var a = _this.array;
                        var result = [];

                        var len = count > (len = a.length) ? len : count;
                        for (var i = 0; i < len; ++i) {
                            result.push(a[i]);
                        }

                        return new List(result);
                    };

                    this.TakeWhile = function (predicate) {
                        var a = _this.array;
                        var result = [];

                        for (var i = 0, n = a.length, e; i < n; ++i) {
                            e = a[i];

                            if (predicate(e)) {
                                result.push(e);
                            } else {
                                break;
                            }
                        }

                        return new List(result);
                    };

                    this.Union = function (second, comparer) {
                        var a = _this.array;
                        var result = [];
                        var hashTable = {};

                        var e, eHash;
                        var getHash = comparer ? comparer.GetHashCode : function (e) {
                            return Object.GetHashCode(e);
                        };

                        for (var i = 0, n = a.length; i < n; ++i) {
                            e = a[i];
                            eHash = getHash(e);

                            if (!hashTable[eHash]) {
                                hashTable[eHash] = e;
                                result.push(e);
                            }
                        }

                        for (var i = 0, n = second.length; i < n; ++i) {
                            e = second[i];
                            eHash = getHash(e);

                            if (!hashTable[eHash]) {
                                hashTable[eHash] = e;
                                result.push(e);
                            }
                        }

                        return new List(result);
                    };

                    this.Where = function (selector) {
                        var a = _this.array;

                        var e;
                        var result = [];

                        for (var i = 0, n = a.length; i < n; ++i) {
                            e = a[i];
                            if (selector(e)) {
                                result.push(e);
                            }
                        }

                        return new List(result);
                    };

                    this.Zip = function (innerArray, resultSelector) {
                        var a = _this.array;
                        var result = [];

                        var len = a.length > innerArray.length ? innerArray.length : a.length;

                        for (var i = 0, n = len; i < n; ++i) {
                            result.push(resultSelector(a[i], innerArray[i]));
                        }

                        return new List(result);
                    };

                    this.ToArray = function () {
                        return _this.array;
                    };
                }
                return List;
            })();
            Generic.List = List;
        })(Collections.Generic || (Collections.Generic = {}));
        var Generic = Collections.Generic;
    })(System.Collections || (System.Collections = {}));
    var Collections = System.Collections;

    Array.prototype.ToList = function () {
        return new List(this);
    };
})(System || (System = {}));

var List = System.Collections.Generic.List;

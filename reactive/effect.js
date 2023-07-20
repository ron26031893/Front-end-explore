const effectStack = [];
let activeEffect;
function registerEffect(effect, options) {
  const effectWrapper = () => {
    clearDeps(effectWrapper);
    activeEffect = effectWrapper;
    effectStack.push(activeEffect);
    effect();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length-1];
  };
  effectWrapper.options = options;
  activeEffect = effectWrapper;
  effectStack.push(activeEffect);
  effect();
  effectStack.pop();
  activeEffect = effectStack[effectStack.length - 1];
}

function clearDeps(effectWrapper) {
  for (const dep of effectWrapper.deps) {
    dep.delete(effectWrapper);
  }
}

function getCurEffect() {
  return activeEffect;
}

const objMap = new WeakMap();
const depsMap = new Map();
function track(obj, key) {
  let keysMap = objMap.get(obj);
  if (keysMap) {
    let deps = keysMap.get(key);
    if (deps) {
      deps.add(activeEffect);
    } else {
      deps =new Set([activeEffect]);
      if (activeEffect.deps) {
        activeEffect.deps.push(deps);
      } else {
        activeEffect.deps = [deps];
      }
      keysMap.set(key, deps);
    }
  } else {
    keysMap = new Map();
    let deps = new Set([activeEffect]);
    keysMap.set(key, deps);
    if (activeEffect.deps) {
      activeEffect.deps.push(deps);
    } else {
      activeEffect.deps = [deps];
    }
    objMap.set(obj, keysMap);
  }
}

function trigger(obj, key) {
  const keysMap = objMap.get(obj);
  const depsToRun = new Set(keysMap.get(key));
  for (const effect of depsToRun) {
    if(effect!==activeEffect){
      effect();
    }
  }
}

const p = new Proxy(
  { test: 1, flag: true, test2:1 },
  {
    get(target, key, proxy) {
      track(target, key);
      return Reflect.get(target, key);
    },
    set(target, key, value, proxy) {
      target[key] = value;
      trigger(target, key);
      return true;
    },
  }
);

registerEffect(() => {
  if (p.flag) {
    console.log(p.test);
  } else {
    console.log(1);
  }
  p.test2++;
}, {});

p.test = 3;
p.flag = false;
p.test = 5;

module.exports = {
  registerEffect,
  getCurEffect,
};


export function createStore(reducer, enhancer) {
    if (enhancer) {
        // 准备强化createStore
        return enhancer(createStore)(reducer)
    }
    let state = undefined
    const subListeners = []

    function getState() {
        return state
    }

    function dispatch(action) {
        // 执行reduce，拿到状态
        state = reducer(state, action)
        // 通知订阅者
        subListeners.forEach(sub => sub())
        return action
    }

    function subscribe(cb) {
        subListeners.push(cb)
    }
    // 立即执行一次dispatch，用于初始化reducer里面默认state
    dispatch({ type: '@XWATSON/INIT-REDUX' })
    return {
        getState,
        dispatch,
        subscribe
    }
}

export function applyMiddleware(...middlewares) {
    return createStore => (...args) => {
        // 先创建store
        const store = createStore(...args)
        // 拿出dispatch
        let dispatch = store.dispatch
        // 定义api
        const midApi = {
            getState: store.getState,
            dispatch: (...args) => dispatch(...args)
        }
        // 执行middlewares中所有中间件，并让每个中间件都能拿到getState，dispatch参数
        const chain = middlewares.map(mw => mw(midApi))
        // 强化dispatch，函数复合
        dispatch = compose(...chain)(store.dispatch)
        console.log('compose后的dispatch--', dispatch)
        // 返回全新的store
        return {
            ...store,
            dispatch // 强化后的dispatch
        }
    }
}

export function compose(...funcs) {
    if (funcs.length === 0) {
        return (...args) => args
    }
    if (funcs.length === 1) {
        return funcs[0]
    }
    // 聚合funcs，假如有三个函数 fn1 fn2 fn3，执行步骤：
    // 第一步：left=fn1，right=fn2，执行调用后
    // 第二步：left=fn2(fn1())，right=fn3
    // 第三步最终返回： (...args) => fn3(fn2(fn1(...args)))
    // 当前执行顺序是 fn1 -> fn2 -> fn3
    return funcs.reduce((left, right) => (...args) => {
        return right(left(...args))
    })
}
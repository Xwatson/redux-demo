import React, { Component } from 'react'
import { createStore, applyMiddleware } from '../redux'
import { counter } from '../store'

// 模拟logger日志
function logger({ getState }) {
    console.log('compose：', 1111)
    return dispatch => action => {
        console.log('call：', 1111)
        console.log('logger:')
        console.log('action:', action)
        const next = dispatch(action)
        console.log('next state:', getState())
        return next
    }
}
// 模拟redux-thunk处理dispatch一个函数
function thunk({ getState }) {
    console.log('compose：', 3333)
    return dispatch => action => {
        console.log('call：',3333)
        if (typeof action === 'function') {
            return action(dispatch, getState)
        }
        return dispatch(action)
    }
}
// 异步接口中间件
function fetchMiddleware() {
    console.log('compose：', 2222)
    return dispatch => action => {
        console.log('call：',2222)
        if (action.type !== 'fetch') {
            return dispatch(action)
        }
        let promise = Promise.resolve({})
        switch (action.api) {
            case 'getCounter':
                dispatch({ type: 'loading', payload: true })
                // 模拟异步请求
                promise = new Promise((resolve) => {
                    setTimeout(() => {
                        const data = Math.floor(Math.random() * 100)
                        dispatch({ type: 'set', payload: data })
                        dispatch({ type: 'loading', payload: false })
                        resolve({ data })
                    }, 1000)
                })
                break;
            default:
                break;
        }
        return promise
    } 
}
const store = createStore(counter, applyMiddleware(logger, fetchMiddleware, thunk))

export default class ReduxTest extends Component {
    componentDidMount() {
        store.subscribe(() => {
            this.forceUpdate()
        })
    }
    render() {
        return (
            <div>
                <h2>
                    {store.getState()}
                </h2>
                <button onClick={() => store.dispatch({ type: 'add' })}>+</button>
                <button onClick={() => store.dispatch({ type: 'minus' })}>-</button>
                <button onClick={() => store.dispatch(function(dispatch) {
                    setTimeout(() => {
                        dispatch({ type: 'add' })
                    }, 1000)
                })} >async</button>
                <button onClick={() => {
                    const promise = store.dispatch({ type: 'fetch', api: 'getCounter' })
                    promise.then(data => {
                        console.log('接口请求成功：', data)
                    })
                }}>fetch</button>
            </div>
        )
    }
}

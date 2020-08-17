
export function counter(state = 0, action) {
    switch (action.type) {
        case 'add':
            return state + 1
        case 'minus':
            return state - 1
        case 'set':
            return action.payload
        default:
            return state
    }
}
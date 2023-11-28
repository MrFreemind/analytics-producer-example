const createAnalyticsFunction = <T extends Record<string, any>>(eventName: string) => {
    console.log('createAnalyticsFunction', 'eventName', eventName)

    return (data: T) => {
        console.log('createAnalyticsFunction', 'eventName', eventName, 'data', data)
    }
}

export default createAnalyticsFunction;

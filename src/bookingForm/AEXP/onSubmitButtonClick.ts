import createAnalyticsFunction from '@/createAnalyticsFunction'

type Data = {
    source: 'bookingForm' | 'bookingFormModal' | 'bookingFormModalButton';
}

export default createAnalyticsFunction<Data>('onSubmit/button/click')

import createAnalyticsFunction from '@/createAnalyticsFunction'

export type Data = {
    source: 'bookingForm' | 'bookingFormModal' | 'bookingFormModalButton';
}

export default createAnalyticsFunction<Data>('onSubmit/button/clickWOW')

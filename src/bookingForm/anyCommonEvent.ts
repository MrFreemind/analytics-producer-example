import createAnalyticsFunction from '@/createAnalyticsFunction'

type Data = {
  uuid: string;
  name: string;
  id: number;
}

export default createAnalyticsFunction<Data>('any/common/event')

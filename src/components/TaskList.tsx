import { FC, memo } from 'react'
import { useQueryTasks } from '../hooks/useQueryTasks'
import { TaskItem } from './TaskItem'

export const TaskList: FC = () => {
  const { status, data } = useQueryTasks()
  console.log('rendered TaskList')
  if (status === 'loading') return <div>{'Loading...'}</div>
  if (status === 'error') return <div>{'Error'}</div>

  return (
    <div>
      {data?.map((task) => (
        <div key={task.id}>
          <ul>
            <TaskItem task={task} />
          </ul>
        </div>
      ))}
    </div>
  )
}

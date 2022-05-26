import axios from 'axios'
import { useAppDispatch } from '../app/hooks'
import { resetEditedTask } from '../slices/todoSlice'
import { useQueryClient, useMutation } from 'react-query'
import { Task, EditTask } from '../types/types'

export const useMutateTask = () => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  const createTaskMutation = useMutation(
    // 以下のOmit<EditTask, 'id'>は、EditTask型からidだけを取り除いた型を指定している。
    (task: Omit<EditTask, 'id'>) =>
      axios.post<Task>(`${process.env.REACT_APP_REST_URL}/tasks/`, task),
    {
      onSuccess: (res) => {
        const previousTodos = queryClient.getQueryData<Task[]>('tasks')
        if (previousTodos) {
          queryClient.setQueryData<Task[]>('tasks', [
            ...previousTodos,
            res.data,
          ])
        }
        dispatch(resetEditedTask())
      },
    }
  )

  const updateTaskMutation = useMutation(
    (task: EditTask) =>
      axios.put<Task>(
        `${process.env.REACT_APP_REST_URL}/tasks/${task.id}/`,
        task
      ),
    {
      onSuccess: (res, variables) => {
        const previousTodos = queryClient.getQueryData<Task[]>('tasks')
        if (previousTodos) {
          queryClient.setQueryData<Task[]>(
            'tasks',
            previousTodos.map((task) =>
              task.id === variables.id ? res.data : task
            )
          )
        }
        dispatch(resetEditedTask()) // 更新完了後、Stateを初期化する。
      },
    }
  )
  const deleteTaskMutation = useMutation(
    (id: number) =>
      axios.delete(`${process.env.REACT_APP_REST_URL}/tasks/${id}/`),
    {
      // サーバ側でのdelete処理成功のresponseを受けたら、react-queryのキャッシュを更新する。
      onSuccess: (res, variables) => {
        // キャッシュから既存データを取得
        const previousTodos = queryClient.getQueryData<Task[]>('task')
        if (previousTodos) {
          queryClient.setQueryData<Task[]>(
            'tasks',
            previousTodos.filter((task) => task.id !== variables) // 削除したデータを除外してキャッシュを更新。
          )
        }
        dispatch(resetEditedTask())
      },
    }
  )

  return { deleteTaskMutation, createTaskMutation, updateTaskMutation }
}

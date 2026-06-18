import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-2xl shadow-sm">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Todos (Supabase Test)</h1>
      <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
        {todos && todos.length > 0 ? (
          todos.map((todo) => (
            <li key={todo.id} className="text-sm">{todo.name}</li>
          ))
        ) : (
          <p className="text-sm text-gray-400">No todos found. Make sure your "todos" table is created and has rows in Supabase!</p>
        )}
      </ul>
    </div>
  )
}

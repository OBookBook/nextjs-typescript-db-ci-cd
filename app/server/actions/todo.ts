"use server";

import type TodoCreateInputSchema from "prisma/generated/zod/inputTypeSchemas/TodoCreateInputSchema";
import { revalidatePath } from "next/cache";
import TodoUpdateInputSchema from "prisma/generated/zod/inputTypeSchemas/TodoUpdateInputSchema";
import { type Todo } from "prisma/generated/zod/modelSchema/TodoSchema";
import { z } from "zod";

import {
  createTodo,
  deleteTodo,
  getTodos,
  updateTodo,
} from "../data-access-layer/todo";

type ActionResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
};

function handleError<T>(error: unknown, action: string): ActionResponse<T> {
  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: `バリデーションエラー: ${error.errors.map((err) => err.message).join(", ")}`,
      statusCode: 400,
    };
  }
  if (error instanceof Error) {
    return {
      success: false,
      error: `${action}処理でエラーが発生しました: ${error.message}`,
      statusCode: 500,
    };
  }
  return {
    success: false,
    error: `予期せぬエラーが発生しました`,
    statusCode: 500,
  };
}

export async function fetchTodos(): Promise<ActionResponse<Todo[]>> {
  try {
    const todos = await getTodos();
    return { success: true, data: todos };
  } catch (error) {
    return handleError(error, "取得");
  }
}

type TodoCreateInput = z.infer<typeof TodoCreateInputSchema>;
export async function addTodo(
  data: TodoCreateInput,
): Promise<ActionResponse<Todo>> {
  try {
    const newTodo = await createTodo(data);
    revalidatePath("/todo");
    return { success: true, data: newTodo };
  } catch (error) {
    return handleError(error, "作成");
  }
}

type TodoUpdateInput = z.infer<typeof TodoUpdateInputSchema>;
export async function toggleTodoCompletion(
  id: number,
  data: TodoUpdateInput,
): Promise<ActionResponse<Todo>> {
  try {
    const validatedData = TodoUpdateInputSchema.parse(data);
    const updatedTodo = await updateTodo(id, validatedData);
    revalidatePath("/todo");
    return { success: true, data: updatedTodo };
  } catch (error) {
    return handleError(error, "更新");
  }
}

export async function removeTodo(id: number): Promise<ActionResponse> {
  try {
    await deleteTodo(id);
    revalidatePath("/todo");
    return { success: true };
  } catch (error) {
    return handleError(error, "削除");
  }
}

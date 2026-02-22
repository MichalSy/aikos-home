import { createClient } from './supabase/server';

// Table prefix from aikoapp.json app-name (dashes to underscores)
const TABLE_PREFIX = 'aikos_home';

function tableName(name: string): string {
  return `${TABLE_PREFIX}_${name}`;
}

export interface Quest {
  id: number;
  title: string;
  description: string | null;
  status: string;
  is_ready: boolean;
  priority: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  quest_id: number;
  title: string;
  description: string | null;
  status: string;
  is_ready: boolean;
  sort_order: number;
  result: string | null;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  key: string;
  value: string;
}

// Quests
export async function getQuests(): Promise<(Quest & { tasks: Task[] })[]> {
  const supabase = await createClient();
  
  const { data: quests, error } = await supabase
    .from(tableName('quests'))
    .select('*')
    .order('sort_order', { ascending: true });
  
  if (error) throw error;
  if (!quests) return [];
  
  // Fetch tasks for all quests
  const questIds = quests.map(q => q.id);
  const { data: tasks } = await supabase
    .from(tableName('tasks'))
    .select('*')
    .in('quest_id', questIds)
    .order('sort_order', { ascending: true });
  
  const tasksByQuest = (tasks || []).reduce((acc, task) => {
    if (!acc[task.quest_id]) acc[task.quest_id] = [];
    acc[task.quest_id].push(task);
    return acc;
  }, {} as Record<number, Task[]>);
  
  return quests.map(quest => ({
    ...quest,
    tasks: tasksByQuest[quest.id] || []
  }));
}

export async function createQuest(data: { 
  title: string; 
  description?: string; 
  priority?: string; 
  sort_order?: number;
}): Promise<number> {
  const supabase = await createClient();
  
  const { data: result, error } = await supabase
    .from(tableName('quests'))
    .insert({
      title: data.title,
      description: data.description || '',
      status: 'todo',
      is_ready: false,
      priority: data.priority || 'medium',
      sort_order: data.sort_order || 0
    })
    .select('id')
    .single();
  
  if (error) throw error;
  return result.id;
}

export async function updateQuest(id: number, data: Partial<Quest>): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from(tableName('quests'))
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);
  
  if (error) throw error;
}

export async function deleteQuest(id: number): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from(tableName('quests'))
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Tasks
export async function createTask(data: {
  quest_id: number;
  title: string;
  description?: string;
  sort_order?: number;
}): Promise<number> {
  const supabase = await createClient();
  
  const { data: result, error } = await supabase
    .from(tableName('tasks'))
    .insert({
      quest_id: data.quest_id,
      title: data.title,
      description: data.description || '',
      status: 'todo',
      is_ready: false,
      sort_order: data.sort_order || 0
    })
    .select('id')
    .single();
  
  if (error) throw error;
  return result.id;
}

export async function updateTask(id: number, data: Partial<Task>): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from(tableName('tasks'))
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);
  
  if (error) throw error;
}

export async function deleteTask(id: number): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from(tableName('tasks'))
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Settings
export async function getSettings(): Promise<Record<string, string>> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from(tableName('settings'))
    .select('key, value');
  
  if (error) throw error;
  
  return (data || []).reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {} as Record<string, string>);
}

export async function saveSettings(settings: Record<string, string>): Promise<void> {
  const supabase = await createClient();
  
  const rows = Object.entries(settings).map(([key, value]) => ({
    key,
    value
  }));
  
  // Upsert each setting
  for (const row of rows) {
    const { error } = await supabase
      .from(tableName('settings'))
      .upsert(row, { onConflict: 'key' });
    
    if (error) throw error;
  }
}

export async function getSetting(key: string): Promise<string | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from(tableName('settings'))
    .select('value')
    .eq('key', key)
    .single();
  
  if (error) return null;
  return data?.value || null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from(tableName('settings'))
    .upsert({ key, value }, { onConflict: 'key' });
  
  if (error) throw error;
}

// Config (legacy - for local password auth)
export async function getConfig(key: string): Promise<string | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from(tableName('config'))
    .select('value')
    .eq('key', key)
    .single();
  
  if (error) return null;
  return data?.value || null;
}

export async function setConfig(key: string, value: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from(tableName('config'))
    .upsert({ key, value }, { onConflict: 'key' });
  
  if (error) throw error;
}

// Sessions (legacy - for local auth)
export async function createSession(token: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from(tableName('sessions'))
    .insert({ token });
  
  if (error) throw error;
}

export async function validateSession(token: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from(tableName('sessions'))
    .select('token')
    .eq('token', token)
    .single();
  
  if (error) return false;
  return !!data;
}

// Reset quest (delete tasks + reset status)
export async function resetQuest(questId: number): Promise<void> {
  const supabase = await createClient();
  
  // Delete all tasks for this quest
  const { error: tasksError } = await supabase
    .from(tableName('tasks'))
    .delete()
    .eq('quest_id', questId);
  
  if (tasksError) throw tasksError;
  
  // Reset quest status
  const { error: questError } = await supabase
    .from(tableName('quests'))
    .update({ status: 'todo', is_ready: false, updated_at: new Date().toISOString() })
    .eq('id', questId);
  
  if (questError) throw questError;
}

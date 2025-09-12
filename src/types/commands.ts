// Common flag types for commands

export interface CommonFlags {
  json?: boolean
}

export interface ListFlags extends CommonFlags {
  assignee?: string
  'created-at'?: string
  creator?: string
  cycle?: string
  'include-archived'?: boolean
  label?: string
  limit?: number
  'order-by'?: string
  parent?: string
  project?: string
  query?: string
  state?: string
  team?: string
  'updated-at'?: string
}

export interface CreateIssueFlags {
  assignee?: string
  cycle?: string
  delegate?: string
  description?: string
  'due-date'?: string
  estimate?: number
  labels?: string
  links?: string
  parent?: string
  priority?: number
  project?: string
  state?: string
  team: string
  title: string
}

export interface UpdateIssueFlags {
  assignee?: string
  cycle?: string
  delegate?: string
  description?: string
  'due-date'?: string
  estimate?: number
  labels?: string
  links?: string
  parent?: string
  priority?: number
  project?: string
  state?: string
  title?: string
}

export interface CreateProjectFlags {
  description?: string
  json?: boolean
  labels?: string
  lead?: string
  name: string
  'start-date'?: string
  state?: string
  summary?: string
  'target-date'?: string
  team: string
}

export interface UpdateProjectFlags {
  description?: string
  json?: boolean
  labels?: string
  lead?: string
  name?: string
  'start-date'?: string
  state?: string
  summary?: string
  'target-date'?: string
}

export interface CreateLabelFlags {
  color: string
  description?: string
  json?: boolean
  name: string
  parent?: string
  team?: string
}

export interface CommentFlags {
  body: string
  parent?: string
}

export interface InitFlags {
  token?: string
}
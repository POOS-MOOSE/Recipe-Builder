export interface Account {
  username: string
  password: string
  email: string
  role: 'user' | 'admin'
}

export interface FormData {
  username: Account['username']
  password: Account['password']
  email: Account['email']
}

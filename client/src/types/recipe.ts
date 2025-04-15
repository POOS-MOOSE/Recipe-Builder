// recipe and meal plan types
export type Recipe = {
  id: string
  name: string
  image: string | null
  servingSize: number
  ingredients: string[]
  instructions: string
  notes: string
}

export type MealPlan = {
  id: string
  title: string
  recipes: Recipe[]
}

export type ViewType = 'recipe' | 'plan' | 'list' | 'recipe-detail' | 'plan-detail'

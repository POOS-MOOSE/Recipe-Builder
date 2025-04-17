import React, { useState, useEffect } from 'react'
import { Nav, Modal, Button, Form, Card, Alert, Row, Col } from 'react-bootstrap'
import { useAuth } from './contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from './utils/axios'
import 'bootstrap/dist/css/bootstrap.min.css'

type Recipe = {
  _id?: string;
  id: string;
  name: string;
  image: string | null;
  imageId?: string; // Added to store the image ID from the backend
  servingSize: number;
  ingredients: {
    name: string;
    quantity: string;
    walmartProductId?: string;
    image?: string;
    price?: number;
    currency?: string;
  }[];
  instructions: string;
  notes: string;
  createdBy: string;
};

type MealPlan = {
  id: string;
  _id?: string; // Add optional _id field for MongoDB ID
  title: string;
  recipes: Recipe[];
};

type ViewType = 'recipe' | 'plan' | 'list' | 'recipe-detail' | 'plan-detail';

const Recipe = () => {
  const { token, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is logged in, if not redirect to login page
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);
  const [activeView, setActiveView] = useState<ViewType>('recipe');
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeletePlanConfirm, setShowDeletePlanConfirm] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [currentPlan, setCurrentPlan] = useState<MealPlan | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [editingMealPlan, setEditingMealPlan] = useState<MealPlan | null>(null);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Reference to the image file input element
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // State to track if we have a new image file to upload
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [newRecipe, setNewRecipe] = useState<Omit<Recipe, 'id' | 'createdBy'>>({
    name: '',
    image: null,
    servingSize: 1,
    ingredients: [] as { name: string; quantity: string; walmartProductId?: string; image?: string; price?: number; currency?: string }[], // This empty array needs to be properly typed
    instructions: '',
    notes: ''
  });
  
  // States for product search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // States for recipe selection in meal plan
  const [selectedRecipesForPlan, setSelectedRecipesForPlan] = useState<Recipe[]>([]);

  // Helper function to get image URL from an imageId
  const getImageUrl = (imageId?: string) => {
    if (!imageId) return null;
    // Use the BACKEND_URL constant to create a full URL with our specific image content path
    // Make sure to include the /api/ prefix since all routes are registered under /api/
    return `${axios.defaults.baseURL}/api/image-content/${imageId}`;
  };

  // Load user's recipes and meal plans when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!isLoggedIn || !token) {
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch recipes
        const recipeResponse = await axios.get('/api/recipes', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (recipeResponse.data && recipeResponse.data.data) {
          // Map the backend recipes to our frontend format
          const fetchedRecipes = recipeResponse.data.data.map((recipe: any) => ({
            id: recipe._id,
            _id: recipe._id,
            name: recipe.name,
            imageId: recipe.imageId,
            image: recipe.imageId ? getImageUrl(recipe.imageId) : null,
            servingSize: 1, // Default value
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            notes: '',
            createdBy: recipe.createdBy
          }));
          
          setRecipes(fetchedRecipes);
        }
        
        // Fetch meal plans
        const planResponse = await axios.get('/api/meal-plans', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (planResponse.data && planResponse.data.data) {
          // Map the backend meal plans to our frontend format
          const fetchedPlans = planResponse.data.data.map((plan: any) => {
            // Each recipeId in the backend response is a populated recipe object
            const planRecipes = plan.recipeIds.map((recipe: any) => ({
              id: recipe._id,
              _id: recipe._id,
              name: recipe.name,
              image: null,
              servingSize: recipe.servingSize || 1,
              ingredients: recipe.ingredients,
              instructions: recipe.instructions,
              notes: recipe.notes || '',
              createdBy: recipe.createdBy
            }));
            
            return {
              id: plan._id,
              _id: plan._id,
              title: plan.title,
              recipes: planRecipes
            };
          });
          
          setPlans(fetchedPlans);
        }
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isLoggedIn, token]);

  const handleIngredientChange = (index: number, field: 'name' | 'quantity', value: string) => {
    const updatedIngredients = [...newRecipe.ingredients];
    updatedIngredients[index][field] = value;
    setNewRecipe({
      ...newRecipe,
      ingredients: updatedIngredients
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Store the file for later upload
      setImageFile(file);
      
      // Also show preview in the UI
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewRecipe({
          ...newRecipe,
          image: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn || !token) {
      setError('You must be logged in to save recipes');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Sanitize ingredients data to remove _id fields and handle null values
      const sanitizedIngredients = newRecipe.ingredients.map(ingredient => {
        // Start with required fields
        const sanitized: any = {
          name: ingredient.name,
          quantity: ingredient.quantity
        };
        
        // Only add optional fields if they have valid values
        if (ingredient.walmartProductId) sanitized.walmartProductId = ingredient.walmartProductId;
        if (ingredient.image) sanitized.image = ingredient.image;
        if (ingredient.price) sanitized.price = ingredient.price;
        if (ingredient.currency) sanitized.currency = ingredient.currency;
        
        return sanitized;
      });
      
      // Only include fields that are allowed by the backend Joi validation
      const recipeData = {
        name: newRecipe.name,
        ingredients: sanitizedIngredients,
        instructions: newRecipe.instructions,
        // Include imageId if it exists (for keeping the same image during edits)
        ...(editingRecipe?.imageId && !imageFile ? { imageId: editingRecipe.imageId } : {})
      };

      let response;

      // Determine if we need to use the image upload endpoint
      const hasNewImage = !!imageFile;
      
      if (hasNewImage) {
        // If we have a new image, use FormData to send both recipe data and image
        const formData = new FormData();
        
        // Add the recipe data as a JSON string
        formData.append('recipe', JSON.stringify(recipeData));
        
        // Add the image file
        formData.append('image', imageFile);
        
        // Determine the correct endpoint based on whether we're creating or editing
        const endpoint = editingRecipe && editingRecipe._id
          ? `/api/recipes/${editingRecipe._id}/with-image`
          : '/api/recipes/with-image';
        
        // Use the correct HTTP method
        const method = editingRecipe && editingRecipe._id ? 'put' : 'post';
        
        // Make the request
        response = await axios({
          method,
          url: endpoint,
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        // If no new image, use the regular JSON endpoints
        if (editingRecipe && editingRecipe._id) {
          // Update existing recipe
          response = await axios.put(`/api/recipes/${editingRecipe._id}`, recipeData, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        } else {
          // Create new recipe
          response = await axios.post('/api/recipes', recipeData, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        }
      }
      
      // Get the saved recipe from the response
      const savedRecipe = response.data.data;
      
      // Create a local recipe object with the data from the backend
      const savedRecipeFormatted: Recipe = {
        id: savedRecipe._id,
        _id: savedRecipe._id,
        name: savedRecipe.name,
        imageId: savedRecipe.imageId, // Store the image ID returned from the backend
        // If we have a new uploaded image, use the local preview, otherwise construct URL from imageId
        image: newRecipe.image || (savedRecipe.imageId ? getImageUrl(savedRecipe.imageId) : null),
        servingSize: newRecipe.servingSize, // Keep servingSize since backend doesn't store it yet
        ingredients: savedRecipe.ingredients,
        instructions: savedRecipe.instructions,
        notes: newRecipe.notes || '',
        createdBy: savedRecipe.createdBy
      };

      // Update local state based on whether we're editing or creating
      if (editingRecipe) {
        setRecipes(recipes.map(r => r.id === editingRecipe.id ? savedRecipeFormatted : r));
      } else {
        setRecipes([...recipes, savedRecipeFormatted]);
      }
      
      setShowAddRecipeModal(false);
      setNewRecipe({
        name: '',
        image: null,
        servingSize: 1,
        ingredients: [] as { name: string; quantity: string; walmartProductId?: string; image?: string; price?: number; currency?: string }[], // This empty array needs to be properly typed
        instructions: '',
        notes: ''
      });
      // Reset the image file state and file input
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setEditingRecipe(null);
    } catch (err: any) {
      console.error('Error saving recipe:', err);
      setError(err.response?.data?.message || 'Failed to save recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecipe = async (recipe: Recipe) => {
    // Set up edit form with existing recipe data
    setEditingRecipe(recipe);
    setNewRecipe({
      name: recipe.name,
      image: recipe.image,
      servingSize: recipe.servingSize,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      notes: recipe.notes
    });
    setActiveView('recipe');
    setShowAddRecipeModal(true);
  };

  const handleDeleteRecipe = async () => {
    if (!currentRecipe || !currentRecipe._id || !token) {
      setError('Cannot delete recipe. Missing recipe ID or authentication.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await axios.delete(`/api/recipes/${currentRecipe._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update local state after successful deletion
      setRecipes(recipes.filter(r => r.id !== currentRecipe.id));
      setActiveView('recipe');
      setCurrentRecipe(null);
      setShowDeleteConfirm(false);
    } catch (err: any) {
      console.error('Failed to delete recipe:', err);
      setError(err.response?.data?.message || 'Failed to delete recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (newPlanTitle.trim() && selectedRecipesForPlan.length > 0) {
      try {
        setLoading(true);
        setError(null);

        // Extract recipe IDs for sending to the backend
        const recipeIds = selectedRecipesForPlan.map(recipe => recipe._id);
        
        let response;
        
        // If we're editing, update the existing plan
        if (editingMealPlan && editingMealPlan._id) {
          response = await axios.put(`/api/meal-plans/${editingMealPlan._id}`, {
            title: newPlanTitle,
            recipeIds: recipeIds
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        } else {
          // Otherwise create a new plan
          response = await axios.post('/api/meal-plans', {
            title: newPlanTitle,
            recipeIds: recipeIds
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        }

        if (response.data && response.data.data) {
          // Format the saved meal plan for frontend use
          const savedPlan = response.data.data;
          const formattedPlan: MealPlan = {
            id: savedPlan._id,
            _id: savedPlan._id,
            title: savedPlan.title,
            recipes: selectedRecipesForPlan // Use the already-loaded recipe objects
          };
          
          // Update local state
          if (editingMealPlan) {
            // Replace the updated plan in the array
            setPlans(plans.map(p => p.id === editingMealPlan.id ? formattedPlan : p));
            // If we were viewing this plan when we edited it, update the current plan view
            if (currentPlan && currentPlan.id === editingMealPlan.id) {
              setCurrentPlan(formattedPlan);
            }
          } else {
            // Add the new plan to the array
            setPlans([...plans, formattedPlan]);
          }
          
          // Reset form state
          setNewPlanTitle('');
          setSelectedRecipesForPlan([]);
          setEditingMealPlan(null);
          setShowAddPlanModal(false);
        }
      } catch (err: any) {
        console.error('Error saving meal plan:', err);
        setError(err.response?.data?.message || 'Failed to save meal plan');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectRecipeForPlan = (recipe: Recipe) => {
    // Check if recipe is already selected
    if (selectedRecipesForPlan.some(r => r.id === recipe.id)) {
      // If already selected, remove it
      setSelectedRecipesForPlan(selectedRecipesForPlan.filter(r => r.id !== recipe.id));
    } else {
      // If not selected, add it
      setSelectedRecipesForPlan([...selectedRecipesForPlan, recipe]);
    }
  };

  const handleRemoveIngredient = (indexToRemove: number) => {
    setNewRecipe({
      ...newRecipe,
      ingredients: newRecipe.ingredients.filter((_, index) => index !== indexToRemove)
    });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setNewRecipe({ ...newRecipe, servingSize: value });
    }
  };

  const calculateTotalPrice = (ingredients: Recipe['ingredients']): number => {
    return ingredients.reduce((total, ingredient) => {
      if (!ingredient.price) return total;
      
      // Try to extract numeric quantity from string like "2 cups" or "1.5 tbsp"
      let quantityNum = 1;
      const quantityMatch = ingredient.quantity.match(/^(\d*\.?\d+)/);
      if (quantityMatch && quantityMatch[1]) {
        quantityNum = parseFloat(quantityMatch[1]);
      }
      
      return total + (ingredient.price * quantityNum);
    }, 0);
  };

  const handleIngredientQuantityChange = (index: number, value: string) => {
    const updatedIngredients = [...newRecipe.ingredients];
    updatedIngredients[index].quantity = value;
    setNewRecipe({
      ...newRecipe,
      ingredients: updatedIngredients
    });
  };

  const RecipeCard = ({ recipe, onClick }: { recipe: Recipe; onClick: () => void }) => (
    <Card className="mb-3 h-100" onClick={onClick} style={{ cursor: 'pointer' }}>
      {recipe.image && (
        <Card.Img 
          variant="top" 
          src={recipe.image} 
          style={{ height: '200px', objectFit: 'cover' }}
        />
      )}
      <Card.Body>
        <Card.Title>{recipe.name}</Card.Title>
        <div>
          <Card.Text className="mb-1">
            <small className="text-muted">
              {recipe.ingredients.length} ingredients • Serves {recipe.servingSize}
            </small>
          </Card.Text>
          {recipe.ingredients.some(i => i.price) && (
            <div className="mt-2 d-flex align-items-center">
              <span className="badge bg-success me-1">
                ${calculateTotalPrice(recipe.ingredients).toFixed(2)}
              </span>
              <small className="text-muted">total cost</small>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );

  const PlanCard = ({ plan, onClick }: { plan: MealPlan; onClick: () => void }) => (
    <Card className="mb-3 h-100" onClick={onClick} style={{ cursor: 'pointer' }}>
      <Card.Body>
        <Card.Title>{plan.title}</Card.Title>
        <div>
          <Card.Text className="mb-1">
            <small className="text-muted">
              {plan.recipes.length} {plan.recipes.length === 1 ? 'recipe' : 'recipes'}
            </small>
          </Card.Text>
          
          {plan.recipes.some(recipe => recipe.ingredients.some(i => i.price)) && (
            <div className="mt-2 d-flex align-items-center">
              <span className="badge bg-success me-1">
                ${calculateShoppingListTotal(generateShoppingList(plan)).toFixed(2)}
              </span>
              <small className="text-muted">total cost</small>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );

  const RecipeDetailView = ({ 
    recipe, 
    onBack, 
    onEdit,
    onDelete
  }: { 
    recipe: Recipe; 
    onBack: () => void; 
    onEdit: () => void;
    onDelete: () => void;
  }) => (
    <div>
      <Button variant="link" onClick={onBack}>&larr; Back to Recipes</Button>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <h2>{recipe.name}</h2>
        <div>
          <Button variant="outline-primary" className="me-2" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="outline-danger" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
      {recipe.image && (
        <img 
          src={recipe.image} 
          alt={recipe.name}
          style={{ 
            width: '100%', 
            maxHeight: '400px', 
            objectFit: 'cover',
            marginBottom: '2rem' 
          }}
        />
      )}
      <h4>Serving Size</h4>
      <p>{recipe.servingSize}</p>
      
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4 className="mb-0">Ingredients</h4>
        {recipe.ingredients.some(i => i.price) && (
          <div className="badge bg-success p-2">
            Total Cost: ${calculateTotalPrice(recipe.ingredients).toFixed(2)} USD
          </div>
        )}
      </div>
      
      <div className="mb-4">
        {recipe.ingredients.map((ingredient, index) => (
          <div key={index} className="d-flex align-items-center mb-2 p-2 border-bottom">
            {ingredient.image && (
              <img 
                src={ingredient.image} 
                alt={ingredient.name} 
                style={{ width: '40px', height: '40px', objectFit: 'contain', marginRight: '10px' }}
              />
            )}
            <div className="flex-grow-1">
              <div className="fw-bold">{ingredient.name} <span className="fw-normal">({ingredient.quantity})</span></div>
              {ingredient.price && (
                <div className="small text-muted">
                  ${ingredient.price} {ingredient.currency || 'USD'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <h4>Instructions</h4>
      <p style={{ whiteSpace: 'pre-wrap' }}>{recipe.instructions}</p>
      {recipe.notes && (
        <>
          <h4>Notes</h4>
          <p>{recipe.notes}</p>
        </>
      )}
    </div>
  );

  // Function to search for products
  const searchProducts = async () => {
    if (!searchTerm.trim() || !token) {
      return;
    }
    
    try {
      setSearching(true);
      setError(null);
      
      // Call the product search endpoint we added to the backend
      const response = await axios.get(`/api/products/search?term=${encodeURIComponent(searchTerm)}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data && response.data.data.products) {
        setSearchResults(response.data.data.products);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setError('No products found');
      }
    } catch (err: any) {
      console.error('Error searching products:', err);
      setError(err.response?.data?.message || 'Failed to search for products');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };
  
  // Function to add a product as an ingredient
  const addProductAsIngredient = (product: any) => {
    // Add the selected product as an ingredient with all details
    setNewRecipe({
      ...newRecipe,
      ingredients: [
        ...newRecipe.ingredients, 
        { 
          name: product.name,
          quantity: '1', // Default quantity
          walmartProductId: product.id,
          image: product.image || null,
          price: product.price || null,
          currency: product.currency || 'USD'
        }
      ]
    });
    
    // Clear search results
    setShowSearchResults(false);
  };

  // Function to generate shopping list from a meal plan
  const generateShoppingList = (plan: MealPlan) => {
    // Create a map to store consolidated ingredients
    const ingredientMap = new Map<string, {
      name: string;
      totalQuantity: string;
      price?: number;
      currency?: string;
      image?: string;
      recipes: string[]; // Track which recipes use this ingredient
    }>();
    
    // Process each recipe in the plan
    plan.recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        const ingredientKey = ingredient.name.toLowerCase().trim();
        
        // Extract numeric quantity if possible
        let quantityNum = 1;
        const quantityMatch = ingredient.quantity.match(/^(\d*\.?\d+)/);
        if (quantityMatch && quantityMatch[1]) {
          quantityNum = parseFloat(quantityMatch[1]);
        }
        
        // Extract unit if present (e.g., "cups" from "2 cups")
        let unit = '';
        const unitMatch = ingredient.quantity.match(/\d+\s+([a-zA-Z]+)/);
        if (unitMatch && unitMatch[1]) {
          unit = unitMatch[1];
        }
        
        if (ingredientMap.has(ingredientKey)) {
          // Ingredient already in map, update quantities
          const existing = ingredientMap.get(ingredientKey)!;
          
          // Try to combine quantities if they have the same unit
          let newQuantity = existing.totalQuantity;
          
          // If we can extract numbers from both, add them
          const existingQuantityMatch = existing.totalQuantity.match(/^(\d*\.?\d+)/);
          if (existingQuantityMatch && existingQuantityMatch[1] && unitMatch) {
            const existingQuantityNum = parseFloat(existingQuantityMatch[1]);
            newQuantity = `${existingQuantityNum + quantityNum} ${unit}`;
          } else {
            // If units don't match or can't be parsed, just list both
            newQuantity = `${existing.totalQuantity} + ${ingredient.quantity}`;
          }
          
          // Update the map
          ingredientMap.set(ingredientKey, {
            ...existing,
            totalQuantity: newQuantity,
            recipes: [...existing.recipes, recipe.name]
          });
        } else {
          // New ingredient, add to map
          ingredientMap.set(ingredientKey, {
            name: ingredient.name,
            totalQuantity: ingredient.quantity,
            price: ingredient.price,
            currency: ingredient.currency,
            image: ingredient.image,
            recipes: [recipe.name]
          });
        }
      });
    });
    
    // Convert map to array for easier rendering
    return Array.from(ingredientMap.values());
  };

  // Function to handle viewing a meal plan
  const handleViewPlan = (plan: MealPlan) => {
    setCurrentPlan(plan);
    setActiveView('plan-detail');
  };
  
  // Function to handle editing a meal plan
  const handleEditMealPlan = (plan: MealPlan) => {
    setEditingMealPlan(plan);
    setNewPlanTitle(plan.title);
    setSelectedRecipesForPlan(plan.recipes);
    setShowAddPlanModal(true);
  };

  // Function to calculate total cost of a shopping list
  const calculateShoppingListTotal = (shoppingList: ReturnType<typeof generateShoppingList>) => {
    return shoppingList.reduce((total, item) => {
      if (!item.price) return total;
      
      // Try to extract numeric quantity
      let quantityNum = 1;
      const quantityMatch = item.totalQuantity.match(/^(\d*\.?\d+)/);
      if (quantityMatch && quantityMatch[1]) {
        quantityNum = parseFloat(quantityMatch[1]);
      }
      
      return total + (item.price * quantityNum);
    }, 0);
  };

  const handleDeleteMealPlan = async () => {
    if (!currentPlan || !currentPlan._id || !token) {
      setError('Cannot delete meal plan. Missing plan ID or authentication.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await axios.delete(`/api/meal-plans/${currentPlan._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update local state
      setPlans(plans.filter(p => p.id !== currentPlan.id));
      setCurrentPlan(null);
      setActiveView('plan');
      setShowDeletePlanConfirm(false);
    } catch (err: any) {
      console.error('Error deleting meal plan:', err);
      setError(err.response?.data?.message || 'Failed to delete meal plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <Nav variant="tabs">
          <Nav.Item>
            <Nav.Link 
              active={activeView === 'recipe'} 
              onClick={() => setActiveView('recipe')}
            >
              Recipes
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeView === 'plan'} 
              onClick={() => setActiveView('plan')}
            >
              Meal Plans
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>

      {activeView === 'recipe' && (
        <div>
          <div className="d-flex justify-content-between mb-4">
            <h2>My Recipes</h2>
            <Button onClick={() => setShowAddRecipeModal(true)}>
              Add Recipe
            </Button>
          </div>
          
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading your recipes...</p>
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">You don't have any recipes yet. Create your first recipe by clicking "Add Recipe".</p>
            </div>
          ) : (
            <Row xs={1} md={2} lg={3} className="g-4">
              {recipes.map(recipe => (
                <Col key={recipe.id}>
                  <RecipeCard 
                    recipe={recipe}
                    onClick={() => {
                      setCurrentRecipe(recipe);
                      setActiveView('recipe-detail');
                    }}
                  />
                </Col>
              ))}
            </Row>
          )}
        </div>
      )}

      {activeView === 'recipe-detail' && currentRecipe && (
        <RecipeDetailView 
          recipe={currentRecipe} 
          onBack={() => setActiveView('recipe')}
          onEdit={() => handleEditRecipe(currentRecipe)}
          onDelete={() => setShowDeleteConfirm(true)}
        />
      )}

      {activeView === 'plan' && (
        <div>
          <div className="d-flex justify-content-between mb-4">
            <h2>My Meal Plans</h2>
            <Button onClick={() => setShowAddPlanModal(true)}>
              Add Plan
            </Button>
          </div>
          <Row xs={1} md={2} lg={3} className="g-4">
            {plans.map(plan => (
              <Col key={plan.id}>
                <PlanCard 
                  plan={plan}
                  onClick={() => handleViewPlan(plan)}
                />
              </Col>
            ))}
          </Row>
        </div>
      )}

      {activeView === 'plan-detail' && currentPlan && (
        <div>
          <Button variant="link" onClick={() => setActiveView('plan')}>&larr; Back to Meal Plans</Button>
          <div className="d-flex justify-content-between align-items-start mb-4">
            <h2>{currentPlan.title}</h2>
            <div>
              <Button variant="outline-primary" className="me-2" onClick={() => handleEditMealPlan(currentPlan)}>
                Edit
              </Button>
              <Button variant="outline-danger" onClick={() => setShowDeletePlanConfirm(true)}>
                Delete
              </Button>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6">
              <h4 className="mb-3">Recipes in this Plan</h4>
              {currentPlan.recipes.map(recipe => (
                <div key={recipe.id} className="card mb-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="card-title mb-0">{recipe.name}</h5>
                      <span className="badge bg-primary">Serves {recipe.servingSize}</span>
                    </div>
                    <p className="card-text small text-muted mt-2">{recipe.ingredients.length} ingredients</p>
                    {recipe.ingredients.some(i => i.price) && (
                      <div className="small d-flex align-items-center mt-1">
                        <span className="badge bg-success me-1">
                          ${calculateTotalPrice(recipe.ingredients).toFixed(2)}
                        </span>
                        <span className="text-muted">recipe cost</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="col-md-6">
              <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center bg-light">
                  <h4 className="mb-0">Shopping List</h4>
                  <span className="badge bg-success p-2 fs-6">
                    Total: ${calculateShoppingListTotal(generateShoppingList(currentPlan)).toFixed(2)} USD
                  </span>
                </div>
                <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {generateShoppingList(currentPlan).map(ingredient => (
                    <div key={ingredient.name} className="d-flex align-items-center mb-3 p-2 border-bottom">
                      {ingredient.image && (
                        <img 
                          src={ingredient.image} 
                          alt={ingredient.name} 
                          style={{ width: '40px', height: '40px', objectFit: 'contain', marginRight: '10px' }}
                        />
                      )}
                      <div className="flex-grow-1">
                        <div className="fw-bold">{ingredient.name} <span className="fw-normal">({ingredient.totalQuantity})</span></div>
                        {ingredient.price && (
                          <div className="small text-muted">
                            ${ingredient.price} {ingredient.currency || 'USD'} per unit
                          </div>
                        )}
                        <div className="small text-muted">
                          Used in: {ingredient.recipes.join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal show={showAddRecipeModal} onHide={() => setShowAddRecipeModal(false)} size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">
            {editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <Form onSubmit={handleSubmit}>
            <div className="mb-4 p-3 bg-light rounded">
              <h5 className="mb-3 fw-bold">Recipe Info</h5>
              
              <Form.Group className="mb-3">
                <Form.Label>Recipe Name</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Enter recipe name"
                  value={newRecipe.name}
                  onChange={(e) => setNewRecipe({...newRecipe, name: e.target.value})}
                  className="border-0 border-bottom rounded-0"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Featured Image</Form.Label>
                <Form.Control 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="border-0 border-bottom rounded-0"
                  ref={fileInputRef}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Serving Size</Form.Label>
                <Form.Control 
                  type="number" 
                  min="1"
                  placeholder="Number of servings"
                  value={newRecipe.servingSize}
                  onChange={handleQuantityChange}
                  className="border-0 border-bottom rounded-0"
                  required
                />
              </Form.Group>
            </div>

            <div className="mb-4 p-3 bg-light rounded">
              <h5 className="mb-3 fw-bold">Ingredients</h5>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {newRecipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="d-flex align-items-center mb-2 p-2 border-bottom position-relative">
                    <Button 
                      variant="link" 
                      className="position-absolute text-danger" 
                      style={{ top: 0, right: 0, padding: '0', fontSize: '1.2rem' }}
                      onClick={() => handleRemoveIngredient(index)}
                    >
                      &times;
                    </Button>
                    
                    {ingredient.image && (
                      <img 
                        src={ingredient.image} 
                        alt={ingredient.name} 
                        style={{ width: '40px', height: '40px', objectFit: 'contain', marginRight: '10px' }}
                      />
                    )}
                    
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center">
                        <Form.Group style={{ flex: 2, marginRight: '10px' }}>
                          <Form.Label className="small text-muted">Name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Ingredient name"
                            value={ingredient.name}
                            onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                            className="border-0 border-bottom rounded-0"
                            required
                          />
                        </Form.Group>
                        
                        <Form.Group style={{ width: '80px' }}>
                          <Form.Label className="small text-muted">Quantity</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Qty"
                            value={ingredient.quantity}
                            onChange={(e) => handleIngredientQuantityChange(index, e.target.value)}
                            className="border-0 border-bottom rounded-0"
                            required
                          />
                        </Form.Group>
                      </div>
                      
                      {ingredient.price && (
                        <div className="small text-muted mt-1">
                          ${ingredient.price} {ingredient.currency || 'USD'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {newRecipe.ingredients.length > 0 && (
                <div className="mt-3 mb-2 p-2 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">Total Estimated Cost:</span>
                    <span className="fw-bold text-success">${calculateTotalPrice(newRecipe.ingredients).toFixed(2)} USD</span>
                  </div>
                  <div className="small text-muted">
                    Based on ingredient quantities and prices
                  </div>
                </div>
              )}
              <Form.Group className="mb-3">
                <Form.Label>Search for products</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Search for products"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 border-bottom rounded-0"
                />
              </Form.Group>
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={searchProducts}
                className="mt-2"
                disabled={searching}
              >
                {searching ? 'Searching...' : 'Search'}
              </Button>
              {searching && (
                <div className="text-center my-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span className="ms-2">Searching for products...</span>
                </div>
              )}
              {showSearchResults && searchResults.length > 0 && (
                <div className="mt-3 p-3 border rounded">
                  <h6 className="mb-3">Product Search Results:</h6>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {searchResults.map((product, index) => (
                      <div key={index} className="d-flex align-items-center mb-2 p-2 border-bottom">
                        {product.image && (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            style={{ width: '40px', height: '40px', objectFit: 'contain', marginRight: '10px' }}
                          />
                        )}
                        <div className="flex-grow-1">
                          <div className="fw-bold">{product.name}</div>
                          <div className="small text-muted">
                            {product.price && `$${product.price} ${product.currency || 'USD'}`}
                          </div>
                        </div>
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          onClick={() => addProductAsIngredient(product)}
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {showSearchResults && searchResults.length === 0 && !searching && (
                <div className="alert alert-info mt-3">
                  No products found matching your search. Try different keywords.
                </div>
              )}
            </div>

            <div className="mb-4 p-3 bg-light rounded">
              <h5 className="mb-3 fw-bold">Instructions</h5>
              
              <Form.Group className="mb-3">
                <Form.Label>Instructions</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3}
                  placeholder="Enter step-by-step instructions"
                  value={newRecipe.instructions}
                  onChange={(e) => setNewRecipe({...newRecipe, instructions: e.target.value})}
                  className="border-0 border-bottom rounded-0"
                />
              </Form.Group>
            </div>

            <div className="mb-4 p-3 bg-light rounded">
              <h5 className="mb-3 fw-bold">Notes</h5>
              
              <Form.Group className="mb-3">
                <Form.Label>Additional Notes</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={2}
                  placeholder="Any additional notes"
                  value={newRecipe.notes}
                  onChange={(e) => setNewRecipe({...newRecipe, notes: e.target.value})}
                  className="border-0 border-bottom rounded-0"
                />
              </Form.Group>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <Button variant="outline-secondary" onClick={() => setShowAddRecipeModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="px-4">
                {editingRecipe ? 'Update Recipe' : 'Save Recipe'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            Are you sure you want to delete "{currentRecipe?.name}"?
          </Alert>
          <p>This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteRecipe}>
            Delete Recipe
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAddPlanModal} onHide={() => {
        setShowAddPlanModal(false);
        setEditingMealPlan(null);
        setNewPlanTitle('');
        setSelectedRecipesForPlan([]);
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingMealPlan ? 'Edit Meal Plan' : 'Create New Meal Plan'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Plan Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter a name for your meal plan"
              value={newPlanTitle}
              onChange={(e) => setNewPlanTitle(e.target.value)}
              required
            />
          </Form.Group>
          
          <div className="mb-3">
            <label>Select Recipes for this Plan</label>
            <div className="d-flex flex-wrap">
              {recipes.map(recipe => (
                <div key={recipe.id} className="m-1">
                  <Button
                    variant={selectedRecipesForPlan.some(r => r.id === recipe.id) ? "primary" : "outline-primary"}
                    size="sm"
                    onClick={() => handleSelectRecipeForPlan(recipe)}
                  >
                    {recipe.name}
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          {selectedRecipesForPlan.length > 0 && (
            <div className="mb-3">
              <h5 className="mb-2">Selected Recipes:</h5>
              <div className="border p-3 rounded">
                {selectedRecipesForPlan.map(recipe => (
                  <div key={recipe.id} className="mb-2 d-flex justify-content-between align-items-center">
                    <span>{recipe.name}</span>
                    <Button
                      variant="link"
                      className="text-danger"
                      onClick={() => handleSelectRecipeForPlan(recipe)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowAddPlanModal(false);
            setEditingMealPlan(null);
            setNewPlanTitle('');
            setSelectedRecipesForPlan([]);
          }}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSavePlan}
            disabled={!newPlanTitle.trim() || selectedRecipesForPlan.length === 0}
          >
            {editingMealPlan ? 'Save Changes' : 'Create Meal Plan'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      <Modal show={showDeletePlanConfirm} onHide={() => setShowDeletePlanConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            Are you sure you want to delete "{currentPlan?.title}"?
          </Alert>
          <p>This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeletePlanConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteMealPlan}>
            Delete Meal Plan
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Recipe;
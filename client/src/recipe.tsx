import React, { useState, useEffect } from 'react'
import { Nav, Modal, Button, Form, Card, Alert, Row, Col } from 'react-bootstrap'
import { useAuth } from './contexts/AuthContext'
import axios from './utils/axios'
import 'bootstrap/dist/css/bootstrap.min.css'

type Recipe = {
  _id?: string;
  id: string;
  name: string;
  image: string | null;
  servingSize: number;
  ingredients: {
    name: string;
    quantity: string;
    walmartProductId?: string;
  }[];
  instructions: string;
  notes: string;
  createdBy: string;
};

type MealPlan = {
  id: string;
  title: string;
  recipes: Recipe[];
};

type ViewType = 'recipe' | 'plan' | 'list' | 'recipe-detail' | 'plan-detail';

const Recipe = () => {
  const { token, isLoggedIn } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>('recipe');
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [currentPlan, setCurrentPlan] = useState<MealPlan | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newRecipe, setNewRecipe] = useState<Omit<Recipe, 'id' | 'createdBy'>>({
    name: '',
    image: null,
    servingSize: 1,
    ingredients: [] as { name: string; quantity: string; walmartProductId?: string }[], // This empty array needs to be properly typed
    instructions: '',
    notes: ''
  });

  // Load user's recipes when component mounts
  useEffect(() => {
    const fetchRecipes = async () => {
      if (!isLoggedIn || !token) {
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get('/api/recipes', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.data) {
          // Map the backend recipes to our frontend format
          const fetchedRecipes = response.data.data.map((recipe: any) => ({
            id: recipe._id,
            _id: recipe._id,
            name: recipe.name,
            image: null, // Backend doesn't store images yet
            servingSize: 1, // Default value
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            notes: '',
            createdBy: recipe.createdBy
          }));
          
          setRecipes(fetchedRecipes);
        }
      } catch (err: any) {
        console.error('Failed to fetch recipes:', err);
        setError(err.response?.data?.message || 'Failed to load recipes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipes();
  }, [isLoggedIn, token]);

  const handleAddIngredient = () => {
    setNewRecipe({
      ...newRecipe,
      ingredients: [...newRecipe.ingredients, { name: '', quantity: '', walmartProductId: undefined }]
    });
  };

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
      
      // Send recipe to backend
      const response = await axios.post('/api/recipes', {
        name: newRecipe.name,
        ingredients: newRecipe.ingredients,
        instructions: newRecipe.instructions
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Axios automatically throws errors for non-2xx responses,
      // so if we get here, the request was successful
      
      // Get the saved recipe from the response
      const savedRecipe = response.data.data;
      
      // Create a local recipe object with the data from the backend
      const savedRecipeFormatted: Recipe = {
        id: savedRecipe._id,
        _id: savedRecipe._id,
        name: savedRecipe.name,
        image: newRecipe.image, // Keep local image since backend doesn't store it yet
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
        ingredients: [] as { name: string; quantity: string; walmartProductId?: string }[], // This empty array needs to be properly typed
        instructions: '',
        notes: ''
      });
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

  const handleCreatePlan = () => {
    if (newPlanTitle.trim()) {
      const newPlan = {
        id: Date.now().toString(),
        title: newPlanTitle,
        recipes: []
      };
      setPlans([...plans, newPlan]);
      setNewPlanTitle('');
      setShowAddPlanModal(false);
    }
  };

  const handleRemoveRecipeFromPlan = (recipeId: string) => {
    if (currentPlan) {
      const updatedPlan = {
        ...currentPlan,
        recipes: currentPlan.recipes.filter(r => r.id !== recipeId)
      };
      setPlans(plans.map(p => p.id === currentPlan.id ? updatedPlan : p));
      setCurrentPlan(updatedPlan);
    }
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
        <Card.Text className="text-muted">
          Serves: {recipe.servingSize}
        </Card.Text>
      </Card.Body>
    </Card>
  );

  const PlanCard = ({ plan, onClick }: { plan: MealPlan; onClick: () => void }) => (
    <Card className="mb-3 h-100" onClick={onClick} style={{ cursor: 'pointer' }}>
      <Card.Body>
        <Card.Title>{plan.title}</Card.Title>
        <Card.Text className="text-muted">
          {plan.recipes.length} {plan.recipes.length === 1 ? 'recipe' : 'recipes'}
        </Card.Text>
        {plan.recipes.length > 0 && (
          <div className="mt-2">
            <h6 className="text-muted">Includes:</h6>
            <ul className="list-unstyled">
              {plan.recipes.slice(0, 3).map(recipe => (
                <li key={recipe.id}>{recipe.name}</li>
              ))}
              {plan.recipes.length > 3 && (
                <li>...and {plan.recipes.length - 3} more</li>
              )}
            </ul>
          </div>
        )}
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
      <h4>Ingredients</h4>
      <ul>
        {recipe.ingredients.map((ingredient, index) => (
          <li key={index}>{ingredient.name} ({ingredient.quantity})</li>
        ))}
      </ul>
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
                  onClick={() => {
                    setCurrentPlan(plan);
                    setActiveView('plan-detail');
                  }}
                />
              </Col>
            ))}
          </Row>
        </div>
      )}

      {activeView === 'plan-detail' && currentPlan && (
        <div>
          <Button variant="link" onClick={() => setActiveView('plan')}>&larr; Back to Plans</Button>
          <div className="d-flex justify-content-between align-items-start mb-4">
            <h2>{currentPlan.title}</h2>
            <div>
              <Button variant="outline-primary" className="me-2">
                Edit
              </Button>
              <Button variant="outline-danger">
                Delete
              </Button>
            </div>
          </div>
          <h4>Recipes in this plan</h4>
          <Row xs={1} md={2} lg={3} className="g-4">
            {currentPlan.recipes.map(recipe => (
              <Col key={recipe.id}>
                <Card>
                  {recipe.image && (
                    <Card.Img 
                      variant="top" 
                      src={recipe.image} 
                      style={{ height: '150px', objectFit: 'cover' }}
                    />
                  )}
                  <Card.Body>
                    <Card.Title>{recipe.name}</Card.Title>
                    <Card.Text>Serves: {recipe.servingSize}</Card.Text>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveRecipeFromPlan(recipe.id);
                      }}
                    >
                      Remove
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
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
                />
              </Form.Group>
            </div>

            <div className="mb-4 p-3 bg-light rounded">
              <h5 className="mb-3 fw-bold">Ingredients</h5>
              {newRecipe.ingredients.map((ingredient, index) => (
                <div key={index} className="mb-2">
                  <Form.Group className="mb-2">
                    <Form.Label className="small text-muted">Ingredient name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={`Ingredient ${index + 1} name`}
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                      className="mb-2 border-0 border-bottom rounded-0"
                      required
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="small text-muted">Quantity/amount</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={`Quantity (e.g., 2 cups, 1 tbsp)`}
                      value={ingredient.quantity}
                      onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                      className="border-0 border-bottom rounded-0"
                      required
                    />
                  </Form.Group>
                </div>
              ))}
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={handleAddIngredient}
                className="mt-2"
              >
                + Add Ingredient
              </Button>
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

      <Modal show={showAddPlanModal} onHide={() => setShowAddPlanModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Meal Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Plan Title</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="e.g., 'Weekly Dinner Plan'"
              value={newPlanTitle}
              onChange={(e) => setNewPlanTitle(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddPlanModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreatePlan}>
            Create Plan
          </Button>
        </Modal.Footer>
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
    </div>
  );
};

export default Recipe;
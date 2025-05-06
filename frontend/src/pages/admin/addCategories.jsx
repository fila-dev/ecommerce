import { useState, useEffect } from 'react'
import AdminHeader from '../../components/Dashbord/AdminHeader'
import Sidebar from '../../components/Dashbord/Sidebar'
import { FaTrash } from 'react-icons/fa'
import { X, Plus, Tag } from "lucide-react"

const AddCategories = () => {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/categories`)
        const json = await response.json()
        
        if (response.ok) {
          setCategories(json)
        } else {
          setError(json.error || 'Failed to fetch categories')
        }
      } catch (err) {
        setError('Error connecting to server')
        console.error('Error fetching categories:', err)
      }
    }

    fetchCategories()
  }, [])

  const handleAddTag = (e) => {
    e.preventDefault()
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const category = { name, description, tags }
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/categories`, {
        method: 'POST',
        body: JSON.stringify(category),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const json = await response.json()

      if (!response.ok) {
        setError(json.error || 'Failed to add category')
        setSuccess(null)
        return
      }
      
      setName('')
      setDescription('')
      setTags([])
      setError(null)
      setSuccess('Category added successfully!')
      setCategories([...categories, json])

    } catch (err) {
      setError('Error connecting to server')
      setSuccess(null)
      console.error('Error adding category:', err)
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/categories/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCategories(categories.filter(cat => cat._id !== id))
        setSuccess('Category deleted successfully!')
        setError(null)
      } else {
        const json = await response.json()
        setError(json.error || 'Failed to delete category')
        setSuccess(null)
      }
    } catch (err) {
      setError('Error connecting to server')
      setSuccess(null)
      console.error('Error deleting category:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <AdminHeader />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-green-600 dark:text-green-400 tracking-tight">
              Categories Management
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add Category Form */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
                <h3 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
                  Add New Category
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
                      Category Name
                    </label>
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                      rows="4"
                      required
                    />
                  </div>

                  {/* Tags Input */}
                  <div>
                    <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
                      Tags
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          placeholder="Add a tag..."
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                        />
                        <button
                          onClick={handleAddTag}
                          type="button"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                          <Plus size={16} />
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                          >
                            <Tag size={14} />
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              type="button"
                              className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors duration-200"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Add Category
                  </button>

                  {error && <div className="p-4 bg-red-100 text-red-600 rounded-lg">{error}</div>}
                  {success && <div className="p-4 bg-green-100 text-green-600 rounded-lg">{success}</div>}
                </form>
              </div>

              {/* Categories List */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
                <h3 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
                  All Categories
                </h3>
                
                <div className="space-y-4">
                  {error ? (
                    <div className="p-4 bg-red-100 text-red-600 rounded-lg">{error}</div>
                  ) : categories && categories.length > 0 ? (
                    categories.map(category => (
                      <div 
                        key={category._id}
                        className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg transition-all duration-200 hover:shadow-md"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                              {category.name}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300">
                              {category.description}
                            </p>
                            {category.tags && category.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {category.tags.map(tag => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                                  >
                                    <Tag size={12} />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleDelete(category._id)}
                            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition-all duration-200"
                            title="Delete category"
                          >
                            <FaTrash size={20} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No categories found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddCategories
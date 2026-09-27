import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../../services/categoryService';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  FolderTree,
  LayoutGrid,
  List,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

const AdminCategories: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch Categories
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
  });

  const categories = categoriesData?.data || [];

  // Create / Edit Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingCategory) {
        return categoryService.updateCategory(editingCategory.id, { name, description });
      } else {
        return categoryService.createCategory({ name, description });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
      setIsModalOpen(false);
      setName('');
      setDescription('');
      setEditingCategory(null);
      setFormError('');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to save category.';
      toast.error(msg);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully.');
      setCategoryToDelete(null);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to delete category.';
      toast.error(msg);
      setCategoryToDelete(null);
    },
  });

  const handleOpenModal = (category?: any) => {
    setFormError('');
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setDescription(category.description || '');
    } else {
      setEditingCategory(null);
      setName('');
      setDescription('');
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Category name is required.');
      return;
    }
    if (name.trim().length < 2) {
      setFormError('Category name must be at least 2 characters long.');
      return;
    }
    saveMutation.mutate();
  };

  const filteredCategories = categories.filter((cat: any) =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80 dark:border-gray-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Course Categories
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
              <Layers className="h-3 w-3 mr-1" />
              Taxonomy
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Create, edit, and organize the disciplines and topics available across the learning platform.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Category
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <FolderTree className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Total Categories
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              {categories.length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Active Topics
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              {categories.filter((c: any) => c.description).length} Described
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/40 rounded-2xl text-purple-600 dark:text-purple-400">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Catalog Readiness
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              100% Operational
            </p>
          </div>
        </div>
      </div>

      {/* Search & View Mode Bar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search categories by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
          />
        </div>

        <div className="flex items-center space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'table'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            title="Table View"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content Rendering: Table or Grid */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-16 text-center border border-gray-100 dark:border-gray-800">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-16 text-center border border-gray-100 dark:border-gray-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <FolderTree className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">No categories found</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm mx-auto">
            {searchTerm
              ? `No category matches your search "${searchTerm}".`
              : 'Start by creating your first course category.'}
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add New Category
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Category Name</th>
                  <th className="py-3.5 px-6">Description</th>
                  <th className="py-3.5 px-6">Category ID</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {filteredCategories.map((cat: any) => (
                  <tr key={cat.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-gradient-to-tr from-indigo-50 to-indigo-100 dark:from-indigo-950/60 dark:to-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl flex-shrink-0">
                          <FolderTree className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-xs">{cat.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400 max-w-md">
                      <p className="line-clamp-2">{cat.description || 'No description provided'}</p>
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-gray-400 dark:text-gray-500">
                      {cat.id?.substring(0, 10)}...
                    </td>
                    <td className="py-4 px-6 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenModal(cat)}
                        className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer"
                        title="Edit Category"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setCategoryToDelete({ id: cat.id, name: cat.name })}
                        className="p-2 text-rose-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat: any) => (
            <div
              key={cat.id}
              className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                      <FolderTree className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">{cat.name}</h3>
                      <p className="font-mono text-[10px] text-gray-400">ID: {cat.id?.substring(0, 8)}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 line-clamp-3 leading-relaxed">
                  {cat.description || 'No description provided for this category.'}
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 mt-5 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => handleOpenModal(cat)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition flex items-center space-x-1"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setCategoryToDelete({ id: cat.id, name: cat.name })}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition flex items-center space-x-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <FolderTree className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Define topic details and organization
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder="e.g. Artificial Intelligence"
                  className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the topics and scope covered by this category..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50 shadow-md shadow-indigo-600/20 transition cursor-pointer"
                >
                  {saveMutation.isPending ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={() => {
          if (categoryToDelete) {
            deleteMutation.mutate(categoryToDelete.id);
          }
        }}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${categoryToDelete?.name}"? Any courses tagged with this category may lose their category association.`}
        confirmText="Delete Category"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminCategories;

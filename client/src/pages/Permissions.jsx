import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  fetchPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  clearError
} from '../redux/slices/permissionSlice';
import { fetchModules } from '../redux/slices/moduleSlice';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Alert from '../components/ui/Alert';

const permissionSchema = Yup.object().shape({
  moduleId: Yup.string().required('Module is required'),
  action: Yup.string().required('Action is required'),
  description: Yup.string().required('Description is required'),
});

export default function Permissions() {
  const dispatch = useDispatch();
  const { permissions, isLoading, error } = useSelector((state) => state.permissions);
  const { modules } = useSelector((state) => state.modules);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);

  useEffect(() => {
    dispatch(fetchPermissions());
    dispatch(fetchModules());
  }, [dispatch]);

  // Handle Redux errors
  useEffect(() => {
    if (error) {
      setAlertMessage({ 
        type: 'error', 
        message: typeof error === 'string' ? error : error.message || 'An error occurred' 
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      if (selectedPermission) {
        await dispatch(updatePermission({
          id: selectedPermission.id,
          permissionData: values,
        })).unwrap();
        
        // Refresh permissions data
        await dispatch(fetchPermissions());
        
        const moduleName = modules.find(m => m.id === values.moduleId)?.name || 'Unknown Module';
        setAlertMessage({ 
          type: 'success', 
          message: `Permission "${values.action} ${moduleName}" updated successfully` 
        });
      } else {
        await dispatch(createPermission(values)).unwrap();
        
        // Refresh permissions data
        await dispatch(fetchPermissions());
        
        const moduleName = modules.find(m => m.id === values.moduleId)?.name || 'Unknown Module';
        setAlertMessage({ 
          type: 'success', 
          message: `Permission "${values.action} ${moduleName}" created successfully` 
        });
      }
      resetForm();
      setIsModalOpen(false);
      setSelectedPermission(null);
    } catch (error) {
      console.error('Permission operation failed:', error);
      setAlertMessage({ 
        type: 'error', 
        message: typeof error === 'string' ? error : error.message || 'An error occurred' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this permission?')) {
      try {
        await dispatch(deletePermission(id)).unwrap();
        setAlertMessage({ type: 'success', message: 'Permission deleted successfully' });
      } catch (error) {
        console.error('Delete permission failed:', error);
        setAlertMessage({ 
          type: 'error', 
          message: typeof error === 'string' ? error : error.message || 'Failed to delete permission' 
        });
      }
    }
  };

  const columns = [
    {
      key: 'module',
      label: 'Module',
      render: (_, permission) => {
        // Try to find module name from modules array first, then fallback to permission data
        const module = modules.find(m => m.id === permission.moduleId);
        return module?.name || permission.module_name || 'Unknown Module';
      },
    },
    { 
      key: 'action', 
      label: 'Action',
      render: (action) => action ? action.charAt(0).toUpperCase() + action.slice(1) : 'Unknown',
    },
    { 
      key: 'description', 
      label: 'Description',
      render: (description) => description || 'No description'
    },
    {
      key: 'role_count',
      label: 'Roles',
      render: (count, permission) => permission.role_count || 0
    }
  ];

  const renderActions = (permission) => (
    <div className="space-x-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setSelectedPermission(permission);
          setIsModalOpen(true);
        }}
      >
        Edit
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={() => handleDelete(permission.id)}
      >
        Delete
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="box-border flex-grow min-h-0 overflow-auto">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 md:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Permissions</h1>
            <Button onClick={() => setIsModalOpen(true)}>Add Permission</Button>
          </div>

          {/* Toast */}
          {alertMessage && (
            <div className="fixed z-50 max-w-xs top-4 right-4 animate-fade-in">
              <Alert
                type={alertMessage.type}
                message={alertMessage.message}
                onClose={() => setAlertMessage(null)}
              />
            </div>
          )}

          <div className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="w-8 h-8 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : permissions && permissions.length > 0 ? (
              <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                <Table
                  columns={columns}
                  data={permissions}
                  actions={renderActions}
                />
              </div>
            ) : (
              <div className="py-8 text-center bg-white rounded-lg shadow">
                <p className="text-gray-500">No permissions found. Create your first permission to get started.</p>
              </div>
            )}
          </div>

          {/* Permission Form Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedPermission(null);
            }}
            title={selectedPermission ? 'Edit Permission' : 'Create Permission'}
          >
            <Formik
              initialValues={{
                moduleId: selectedPermission?.moduleId || '',
                action: selectedPermission?.action || '',
                description: selectedPermission?.description || '',
              }}
              validationSchema={permissionSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ errors, touched, isSubmitting, values, setFieldValue }) => (
                <Form className="space-y-4">
                  <div>
                    <label htmlFor="moduleId" className="block text-sm font-medium text-gray-700">
                      Module
                    </label>
                    <Field
                      as="select"
                      id="moduleId"
                      name="moduleId"
                      className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                      <option value="">Select a module</option>
                      {modules && modules.map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.name}
                        </option>
                      ))}
                    </Field>
                    {errors.moduleId && touched.moduleId && (
                      <p className="mt-1 text-xs text-red-600">{errors.moduleId}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="action" className="block text-sm font-medium text-gray-700">
                      Action
                    </label>
                    <Field
                      as="select"
                      id="action"
                      name="action"
                      className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                      <option value="">Select an action</option>
                      <option value="create">Create</option>
                      <option value="read">Read</option>
                      <option value="update">Update</option>
                      <option value="delete">Delete</option>
                    </Field>
                    {errors.action && touched.action && (
                      <p className="mt-1 text-xs text-red-600">{errors.action}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <Field>
                      {() => {
                        const module = modules?.find(m => m.id === values.moduleId);
                        const action = values.action;
                        const defaultDescription = module && action && !values.description
                          ? `Can ${action.toLowerCase()} ${module.name.toLowerCase()}`
                          : values.description;

                        return (
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={values.description || defaultDescription || ''}
                            onChange={(e) => setFieldValue('description', e.target.value)}
                            placeholder="Enter permission description"
                          />
                        );
                      }}
                    </Field>
                    {errors.description && touched.description && (
                      <p className="mt-1 text-xs text-red-600">{errors.description}</p>
                    )}
                  </div>

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center w-full px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </div>
                      ) : (
                        selectedPermission ? 'Save Changes' : 'Create Permission'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setSelectedPermission(null);
                      }}
                      disabled={isSubmitting}
                      className="inline-flex justify-center w-full px-3 py-2 mt-3 text-sm font-semibold text-gray-900 bg-white rounded-md shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </Modal>
        </div>
      </div>
    </div>
  );
}

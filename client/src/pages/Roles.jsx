import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  assignPermissionsToRole,
} from '../redux/slices/roleSlice';
import { fetchPermissions } from '../redux/slices/permissionSlice';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Alert from '../components/ui/Alert';

const roleSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  description: Yup.string().required('Description is required'),
});

const assignmentSchema = Yup.object().shape({
  permissionIds: Yup.array().min(1, 'Select at least one permission'),
});

export default function Roles() {
  const dispatch = useDispatch();
  const { roles, isLoading } = useSelector((state) => state.roles);
  const { permissions = [] } = useSelector((state) => state.permissions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);

  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchPermissions());
  }, [dispatch]);

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
      if (selectedRole) {
        const result = await dispatch(updateRole({ 
          id: selectedRole.id, 
          roleData: values 
        })).unwrap();
        setAlertMessage({ 
          type: 'success', 
          message: `Role "${result.role.name}" updated successfully` 
        });
      } else {
        const result = await dispatch(createRole(values)).unwrap();
        setAlertMessage({ 
          type: 'success', 
          message: `Role "${result.role.name}" created successfully` 
        });
      }
      resetForm();
      setIsModalOpen(false);
      setSelectedRole(null);
    } catch (error) {
      setAlertMessage({ 
        type: 'error', 
        message: error.message || 'An error occurred' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignPermissions = async (values, { setSubmitting }) => {
    try {
      const result = await dispatch(assignPermissionsToRole({
        roleId: selectedRole.id,
        permissionIds: values.permissionIds,
      })).unwrap();
      
      // Refresh the roles data to get updated permissions
      await dispatch(fetchRoles());
      
      setAlertMessage({ 
        type: 'success', 
        message: `Permissions assigned to "${selectedRole?.name}" successfully` 
      });
      setIsAssignModalOpen(false);
      setSelectedRole(null);
    } catch (error) {
      setAlertMessage({ 
        type: 'error', 
        message: error.message || 'Failed to assign permissions' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await dispatch(deleteRole(id)).unwrap();
        setAlertMessage({ type: 'success', message: 'Role deleted successfully' });
      } catch (error) {
        setAlertMessage({ type: 'error', message: error.message || 'An error occurred' });
      }
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    {
      key: 'permissions',
      label: 'Permissions',
      render: (_, role) => (Array.isArray(role.permissions) ? role.permissions.length : 0),
    },
  ];

  const renderActions = (role) => (
    <div className="space-x-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setSelectedRole(role);
          setIsModalOpen(true);
        }}
      >
        Edit
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setSelectedRole(role);
          setIsAssignModalOpen(true);
        }}
      >
        Assign Permissions
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={() => handleDelete(role.id)}
      >
        Delete
      </Button>
    </div>
  );

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Roles</h1>
          <Button onClick={() => setIsModalOpen(true)}>Add Role</Button>
        </div>

        {/* Toast */}
        {alertMessage && (
          <div className="fixed top-4 right-4 z-50 animate-fade-in">
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : roles && roles.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <Table
                columns={columns}
                data={roles}
                actions={renderActions}
              />
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">No roles found. Create your first role to get started.</p>
            </div>
          )}
        </div>

        {/* Role Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRole(null);
          }}
          title={selectedRole ? 'Edit Role' : 'Create New Role'}
        >
          <Formik
            initialValues={{
              name: selectedRole?.name || '',
              description: selectedRole?.description || '',
            }}
            validationSchema={roleSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <Field
                    type="text"
                    id="name"
                    name="name"
                    className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                  {errors.name && touched.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <Field
                    as="textarea"
                    id="description"
                    name="description"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                  {errors.description && touched.description && (
                    <p className="mt-1 text-xs text-red-600">{errors.description}</p>
                  )}
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      selectedRole ? 'Save Changes' : 'Create Role'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedRole(null);
                    }}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal>

        {/* Assign Permissions Modal */}
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedRole(null);
          }}
          title={`Assign Permissions to ${selectedRole?.name}`}
        >
          <Formik
            initialValues={{
              permissionIds: selectedRole?.permissions?.map(p => p.id) || [],
            }}
            validationSchema={assignmentSchema}
            onSubmit={handleAssignPermissions}
            enableReinitialize
          >
            {({ values, setFieldValue, isSubmitting, errors, touched }) => (
              <Form className="space-y-4">
                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                  {permissions.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No permissions available.</p>
                    </div>
                  ) : (
                    permissions.map((permission) => (
                      <label key={permission.id} className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                        <input
                          type="checkbox"
                          checked={values.permissionIds.includes(permission.id)}
                          onChange={(e) => {
                            const newIds = e.target.checked
                              ? [...values.permissionIds, permission.id]
                              : values.permissionIds.filter(id => id !== permission.id);
                            setFieldValue('permissionIds', newIds);
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-700">{permission.name}</p>
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>

                {errors.permissionIds && touched.permissionIds && (
                  <p className="mt-1 text-xs text-red-600">{errors.permissionIds}</p>
                )}

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        <span>Assigning...</span>
                      </div>
                    ) : (
                      'Assign Permissions'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAssignModalOpen(false);
                      setSelectedRole(null);
                    }}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
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
  );
}

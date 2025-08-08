import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  fetchGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  assignUserToGroup, // Fixed: was addUsersToGroup
} from '../redux/slices/groupSlice';
import { fetchUsers } from '../redux/slices/userSlice';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Alert from '../components/ui/Alert';

const groupSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  description: Yup.string().required('Description is required'),
});

const userAssignmentSchema = Yup.object().shape({
  userIds: Yup.array().min(1, 'Select at least one user'),
});

export default function Groups() {
  const dispatch = useDispatch();
  const { groups, isLoading } = useSelector((state) => state.groups);
  const { users = [] } = useSelector((state) => state.users);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);

  useEffect(() => {
    dispatch(fetchGroups());
    dispatch(fetchUsers());
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
      if (selectedGroup) {
        await dispatch(updateGroup({ 
          id: selectedGroup.id, 
          groupData: values 
        })).unwrap();
        
        // Refresh groups to get updated data
        await dispatch(fetchGroups());
        
        setAlertMessage({ 
          type: 'success', 
          message: `Group "${values.name}" updated successfully` 
        });
      } else {
        const result = await dispatch(createGroup(values)).unwrap();
        setAlertMessage({ 
          type: 'success', 
          message: `Group "${result.group.name}" created successfully` 
        });
      }
      resetForm();
      setIsModalOpen(false);
      setSelectedGroup(null);
    } catch (error) {
      setAlertMessage({ 
        type: 'error', 
        message: error.message || 'An error occurred' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignUsers = async (values, { setSubmitting }) => {
    try {
      // Fixed: Use assignUserToGroup instead of addUsersToGroup
      await dispatch(assignUserToGroup({
        groupId: selectedGroup.id,
        userIds: values.userIds,
      })).unwrap();
      
      // Refresh groups to get updated member counts
      await dispatch(fetchGroups());
      
      setAlertMessage({ 
        type: 'success', 
        message: `Users assigned to "${selectedGroup?.name}" successfully` 
      });
      setIsAssignModalOpen(false);
      setSelectedGroup(null);
    } catch (error) {
      setAlertMessage({ 
        type: 'error', 
        message: error.message || 'Failed to assign users' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await dispatch(deleteGroup(id)).unwrap();
        setAlertMessage({ type: 'success', message: 'Group deleted successfully' });
      } catch (error) {
        setAlertMessage({ type: 'error', message: error.message || 'An error occurred' });
      }
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    {
      key: 'users',
      label: 'Members',
      render: (users) => {
        // Fixed: Handle both array and count properly
        if (Array.isArray(users)) {
          return users.length;
        }
        return users || 0;
      },
    },
  ];

  const renderActions = (group) => (
    <div className="space-x-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setSelectedGroup(group);
          setIsModalOpen(true);
        }}
      >
        Edit
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setSelectedGroup(group);
          setIsAssignModalOpen(true);
        }}
      >
        Add Members
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={() => handleDelete(group.id)}
      >
        Delete
      </Button>
    </div>
  );

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Groups</h1>
          <Button onClick={() => setIsModalOpen(true)}>Add Group</Button>
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
          ) : groups && groups.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <Table
                columns={columns}
                data={groups}
                actions={renderActions}
              />
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">No groups found. Create your first group to get started.</p>
            </div>
          )}
        </div>

        {/* Group Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedGroup(null);
          }}
          title={selectedGroup ? 'Edit Group' : 'Create New Group'}
        >
          <Formik
            initialValues={{
              name: selectedGroup?.name || '',
              description: selectedGroup?.description || '',
            }}
            validationSchema={groupSchema}
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
                      selectedGroup ? 'Save Changes' : 'Create Group'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedGroup(null);
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

        {/* Assign Users Modal */}
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedGroup(null);
          }}
          title={`Add Members to ${selectedGroup?.name}`}
        >
          <Formik
            initialValues={{
              // Fixed: Don't pre-select existing users, allow adding new ones
              userIds: [],
            }}
            validationSchema={userAssignmentSchema}
            onSubmit={handleAssignUsers}
            enableReinitialize
          >
            {({ values, setFieldValue, isSubmitting, errors, touched }) => (
              <Form className="space-y-4">
                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                  {users.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No users available.</p>
                    </div>
                  ) : (
                    users
                      .filter(user => {
                        // Filter out users already in the group
                        const existingUsers = selectedGroup?.users || [];
                        return !existingUsers.some(existingUser => existingUser.id === user.id);
                      })
                      .map((user) => (
                        <label key={user.id} className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                          <input
                            type="checkbox"
                            checked={values.userIds.includes(user.id)}
                            onChange={(e) => {
                              const newIds = e.target.checked
                                ? [...values.userIds, user.id]
                                : values.userIds.filter(id => id !== user.id);
                              setFieldValue('userIds', newIds);
                            }}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700">
                              {user.name || user.username}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </label>
                      ))
                  )}
                  
                  {/* Show message if all users are already in group */}
                  {users.length > 0 && users.every(user => {
                    const existingUsers = selectedGroup?.users || [];
                    return existingUsers.some(existingUser => existingUser.id === user.id);
                  }) && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">All available users are already members of this group.</p>
                    </div>
                  )}
                </div>

                {errors.userIds && touched.userIds && (
                  <p className="mt-1 text-xs text-red-600">{errors.userIds}</p>
                )}

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || values.userIds.length === 0}
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        <span>Adding...</span>
                      </div>
                    ) : (
                      'Add Members'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAssignModalOpen(false);
                      setSelectedGroup(null);
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
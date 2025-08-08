import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  fetchModules,
  createModule,
  updateModule,
  deleteModule,
} from '../redux/slices/moduleSlice';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Alert from '../components/ui/Alert';

const moduleSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  description: Yup.string().required('Description is required'),
});

export default function Modules() {
  const dispatch = useDispatch();
  const { modules, isLoading } = useSelector((state) => state.modules);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);

  useEffect(() => {
    dispatch(fetchModules());
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
      if (selectedModule) {
        await dispatch(updateModule({ id: selectedModule.id, moduleData: values })).unwrap();
        setAlertMessage({ type: 'success', message: 'Module updated successfully' });
      } else {
        await dispatch(createModule(values)).unwrap();
        setAlertMessage({ type: 'success', message: 'Module created successfully' });
      }
      resetForm();
      setIsModalOpen(false);
      setSelectedModule(null);
    } catch (error) {
      setAlertMessage({ type: 'error', message: error.message || 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      try {
        await dispatch(deleteModule(id)).unwrap();
        setAlertMessage({ type: 'success', message: 'Module deleted successfully' });
      } catch (error) {
        setAlertMessage({ type: 'error', message: error.message || 'An error occurred' });
      }
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  const renderActions = (module) => (
    <div className="space-x-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setSelectedModule(module);
          setIsModalOpen(true);
        }}
      >
        Edit
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={() => handleDelete(module.id)}
      >
        Delete
      </Button>
    </div>
  );

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Modules</h1>
          <Button onClick={() => setIsModalOpen(true)}>Add Module</Button>
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
          ) : modules && modules.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <Table
                columns={columns}
                data={modules}
                actions={renderActions}
              />
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">No modules found. Create your first module to get started.</p>
            </div>
          )}
        </div>

        {/* Module Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedModule(null);
          }}
          title={selectedModule ? 'Edit Module' : 'Create Module'}
        >
          <Formik
            initialValues={{
              name: selectedModule?.name || '',
              description: selectedModule?.description || '',
            }}
            validationSchema={moduleSchema}
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
                      selectedModule ? 'Save Changes' : 'Create Module'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedModule(null);
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

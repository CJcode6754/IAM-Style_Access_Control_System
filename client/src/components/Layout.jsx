import { Fragment } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { 
  Menu as MenuIcon, 
  X, 
  UserCircle,
  LayoutDashboard,
  Users,
  UsersRound,
  Shield,
  Boxes,
  Key
} from 'lucide-react';
import { logout, selectAuth } from '../redux/slices/authSlice';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'View permissions and simulate actions'
  },
  { 
    name: 'Users', 
    href: '/users',
    icon: Users,
    description: 'Manage system users',
    permission: { module: 'Users', action: 'read' }
  },
  { 
    name: 'Groups', 
    href: '/groups',
    icon: UsersRound,
    description: 'Manage user groups and assignments',
    permission: { module: 'Groups', action: 'read' }
  },
  { 
    name: 'Roles', 
    href: '/roles',
    icon: Shield,
    description: 'Manage roles and group assignments',
    permission: { module: 'Roles', action: 'read' }
  },
  { 
    name: 'Modules', 
    href: '/modules',
    icon: Boxes,
    description: 'Manage system modules',
    permission: { module: 'Modules', action: 'read' }
  },
  { 
    name: 'Permissions', 
    href: '/permissions',
    icon: Key,
    description: 'Manage permissions and role assignments',
    permission: { module: 'Permissions', action: 'read' }
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Layout() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, permissions } = useSelector(selectAuth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const hasPermission = (module, action) => {
    if (!module || !action) return true; // No permission check needed
    return permissions?.some(
      perm => perm.module_name === module && perm.action === action
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Disclosure as="nav" className="bg-white shadow-sm border-b border-gray-200">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center">
                    <div className="flex items-center gap-x-2">
                      <Shield className="h-8 w-8 text-indigo-600" />
                      <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
                        IAM System
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-4">
                    {navigation.map((item) => (
                      hasPermission(item.permission?.module, item.permission?.action) && (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={classNames(
                            location.pathname === item.href
                              ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                              : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                            'inline-flex items-center gap-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150'
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      )
                    ))}
                  </div>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:items-center">
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex items-center gap-x-2 rounded-full bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        <UserCircle className="h-6 w-6 text-gray-600" aria-hidden="true" />
                        <span className="text-sm font-medium text-gray-700">{user?.username}</span>
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm text-gray-900 font-medium truncate">{user?.email}</p>
                        </div>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={classNames(
                                active ? 'bg-gray-50' : '',
                                'flex w-full items-center gap-x-2 px-4 py-2 text-sm text-gray-700 text-left hover:text-red-600'
                              )}
                            >
                              <X className="h-4 w-4" />
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
                <div className="-mr-2 flex items-center sm:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <X className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 pb-3 pt-2">
                {navigation.map((item) => (
                  hasPermission(item.permission?.module, item.permission?.action) && (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        location.pathname === item.href
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                        'flex items-center gap-x-3 border-l-4 py-2 pl-3 pr-4 text-base font-medium transition-colors duration-150'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                    </Link>
                  )
                ))}
              </div>
              <div className="border-t border-gray-200 pb-3 pt-4">
                <div className="px-4 py-2">
                  <div className="text-base font-medium text-gray-800">{user?.username}</div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
                <div className="mt-3 space-y-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-x-2 px-4 py-2 text-base font-medium text-red-600 hover:bg-gray-50"
                  >
                    <X className="h-5 w-5" />
                    Sign out
                  </button>
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <div className="py-6">
        <main>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

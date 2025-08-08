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
    if (!module || !action) return true;
    return permissions?.some(
      perm => perm.module_name === module && perm.action === action
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Disclosure as="nav" className="bg-white border-b border-gray-200 shadow-sm">
        {({ open }) => (
          <>
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <div className="flex items-center flex-shrink-0">
                    <div className="flex items-center gap-x-2">
                      <Shield className="w-8 h-8 text-indigo-600" />
                      <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text whitespace-nowrap">
                        IAM System
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                    {navigation.map((item) => (
                      hasPermission(item.permission?.module, item.permission?.action) && (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={classNames(
                            location.pathname === item.href
                              ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                              : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                            'inline-flex items-center gap-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 whitespace-nowrap'
                          )}
                        >
                          <item.icon className="flex-shrink-0 w-4 h-4" />
                          {item.name}
                        </Link>
                      )
                    ))}
                  </div>
                </div>
                <div className="hidden sm:flex sm:items-center sm:ml-6">
                  <Menu as="div" className="relative ml-3">
                    <Menu.Button className="flex items-center p-2 text-sm bg-white rounded-full gap-x-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      <UserCircle className="w-6 h-6 text-gray-600" aria-hidden="true" />
                      <span className="max-w-xs text-sm font-medium text-gray-700 truncate">{user?.username}</span>
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
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
                              <X className="w-4 h-4" />
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
                <div className="flex items-center -mr-2 sm:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center p-2 text-gray-400 bg-white rounded-md hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <span className="sr-only">{open ? 'Close main menu' : 'Open main menu'}</span>
                    {open ? (
                      <X className="block w-6 h-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block w-6 h-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="w-full sm:hidden">
              <div className="pt-2 pb-3 space-y-1">
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
                      <item.icon className="flex-shrink-0 w-5 h-5" />
                      <div>
                        <div className="font-medium truncate">{item.name}</div>
                        <div className="text-sm text-gray-500 truncate">{item.description}</div>
                      </div>
                    </Link>
                  )
                ))}
              </div>
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="px-4 py-2">
                  <div className="text-base font-medium text-gray-800 truncate">{user?.username}</div>
                  <div className="text-sm text-gray-500 truncate">{user?.email}</div>
                </div>
                <div className="px-4 mt-3 space-y-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-base font-medium text-red-600 gap-x-2 hover:bg-gray-50"
                  >
                    <X className="w-5 h-5" />
                    Sign out
                  </button>
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <div className="flex-grow py-6">
        <main>
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

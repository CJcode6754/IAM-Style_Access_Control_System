import expressValidator from "express-validator";

const { body, param, validationResult } = expressValidator;

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

const validateUser = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be between 3 and 50 characters long")
    .matches(/^[a-zA-Z0-9_\s]+$/)
    .withMessage(
      "Username can only contain letters, numbers, underscores, and spaces"
    ),
  body("email")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  handleValidationErrors,
];

const validateLogin = [
  body("email").trim().notEmpty().withMessage("Email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

const validateGroup = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Group name must be between 1 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Description must be less than 255 characters"),
  handleValidationErrors,
];

const validateRole = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Role name must be between 1 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Description must be less than 255 characters"),
  handleValidationErrors,
];

const validateModule = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Module name must be between 1 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Description must be less than 255 characters"),
  handleValidationErrors,
];

const validatePermission = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Permission name must be between 1 and 100 characters"),
  body("action")
    .isIn(["create", "read", "update", "delete"])
    .withMessage("Action must be one of: create, read, update, delete"),
  body("module_id")
    .isInt({ min: 1 })
    .withMessage("Module ID must be a positive integer"),
  handleValidationErrors,
];

const validateId = [
  param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  handleValidationErrors,
];

const validateAssignment = [
  body("userIds").optional().isArray().withMessage("User IDs must be an array"),
  body("userIds.*")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Each user ID must be a positive integer"),
  body("roleIds").optional().isArray().withMessage("Role IDs must be an array"),
  body("roleIds.*")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Each role ID must be a positive integer"),
  body("permissionIds")
    .optional()
    .isArray()
    .withMessage("Permission IDs must be an array"),
  body("permissionIds.*")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Each permission ID must be a positive integer"),
  handleValidationErrors,
];

export {
  validateUser,
  validateLogin,
  validateGroup,
  validateRole,
  validateModule,
  validatePermission,
  validateId,
  validateAssignment,
  handleValidationErrors,
};

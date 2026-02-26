// HEADER: Re-exports models for a stable import path used by services/controllers.
module.exports = require('../models');

/*
BOTTOM EXPLANATION
- Responsibility: Keeps DB imports consistent by exposing models from one location.
- Key syntax: `module.exports = require(...)` forwards exports directly.
- Common mistakes: Importing from many DB paths can make refactoring harder.
*/

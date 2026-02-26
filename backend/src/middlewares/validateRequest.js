// HEADER: Request validation middleware that applies a Zod schema before controllers run.
function validateRequest(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    next();
  };
}

module.exports = validateRequest;

/*
BOTTOM EXPLANATION
- Responsibility: Blocks invalid requests early so controller logic stays focused on business flow.
- Key syntax: `schema.safeParse(...)` returns success/error without throwing exceptions.
- Common mistakes: Skipping validation leads to hard-to-debug SQL/OpenSearch errors later.
*/

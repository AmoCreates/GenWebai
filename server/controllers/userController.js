// Controller to fetch current authenticated user details
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "user not found" });
    else return res.status(200).json(req.user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `something went wrong!! can't get current user, err: ${error}` });
  }
};
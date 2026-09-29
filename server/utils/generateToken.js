import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "skillsphere_super_secret_jwt_key_2026_final_year_project",
    {
      expiresIn: "30d",
    }
  );
};

export default generateToken;

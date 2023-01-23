import { NextApiRequest, NextApiResponse } from "next";

export default (req: NextApiRequest, res: NextApiResponse) => {
  console.log(req.query.id);

  const users = [
    { id: 1, name: "Caio" },
    { id: 2, name: "Diego" },
    { id: 3, name: "Dunha" },
  ];

  return res.json(users);
};

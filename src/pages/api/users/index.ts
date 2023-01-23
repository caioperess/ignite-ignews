import { NextApiRequest, NextApiResponse } from "next";

export default (req: NextApiRequest, res: NextApiResponse) => {
  const users = [
    { id: 1, name: "Caio" },
    { id: 2, name: "Diego" },
    { id: 3, name: "Dunha" },
  ];

  return res.json(users);
};

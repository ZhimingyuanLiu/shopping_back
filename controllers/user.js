const User = require('../models/user');
exports.userById = async (req, res, next, id) => {
  try {
    const user = await User.findById(id);
    req.profile = user;
    next();
  } catch (error) {
    return res.status(400).json({
      error: 'User not found'
    });
  }
};

exports.read = async (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};
exports.update = async (req, res) => {
  // console.log('UPDATE USER - req.user', req.user, 'UPDATE DATA', req.body);
  // try {
  //   const { name, password } = req.body;
  //   if (!name || !password) {
  //     return res.status(400).json({
  //       error: 'Name and Password are required'
  //     });
  //   }
  //   if (password.length < 6) {
  //     return res.status(400).json({
  //       error: 'Password should be min 6 characters long'
  //     });
  //   }
  //   const user = await User.findOne({ _id: req.profile._id });
  //   user.name = name;
  //   user.password = password;

  //   const updatedUser = await user.save();
  //   updatedUser.hashed_password = undefined;
  //   updatedUser.salt = undefined;
  //   res.json(updatedUser);
  // } catch (err) {
  //   res.status(400).json({
  //     error: 'User update failed'
  //   });
  // }
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.profile._id },
      { $set: req.body },
      { new: true }
    );
    user.hashed_password = undefined;
    user.salt = undefined;
    res.json(user);
  } catch (err) {
    return res.status(400).json({
      error: 'You are not authried to perform this action'
    });
  }
};

exports.addOrderToUserHistory = (req, res, next) => {
  let history = [];

  req.body.order.products.forEach(item => {
    history.push({
      _id: item._id,
      name: item.name,
      description: item.description,
      category: item.category,
      quantity: item.count,
      transaction_id: req.body.order.transaction_id,
      amount: req.body.order.amount
    });
  });

  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { history: history } },
    { new: true },
    (error, data) => {
      if (error) {
        return res.status(400).json({
          error: 'Could not update user purchase history'
        });
      }
      next();
    }
  );
};

exports.purchaseHistory = (req, res) => {
  Order.find({ user: req.profile._id })
    .populate('user', '_id name')
    .sort('-created')
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      res.json(orders);
    });
};

const { User, Post } = require("./db/schema");
const bcrypt = require("bcrypt");

//signup page controller

const home_login = async (req, res) => {
  const data = { user: req.session.existinguser, data: req.flash("error") };
  if (req.session.existinguser) {
    res.redirect("/login");
  } else {
    await res.render("home.ejs", data);
  }
};

//welcome page controller

const home_welcome = async (req, res) => {
  if (req.session.existinguser) {
    // get posts

    const user = await User.findById(req.session.existinguser.id);
    let arr = [];
    await Promise.all(
      user.following.map(async (data) => {
        let user = await User.findById(data);
        let username = user.Username.toString();
        let followpost = await Post.find({ auther: username });
        followpost.map((post) => {
          arr.push(post);
        });
      })
    );
    const data = { posts: arr, user: req.session.existinguser };
    res.render("home_welcome", data);
  } else {
    res.render("home");
  }
};

// new post
const newpost = (req, res) => {
  res.render("newpost.ejs", (user = req.session.existinguser));
};

// signup controller

const signup = async (req, res) => {
  // checking user is Existed or not

  const { Username, Email, Password, Number, Profile } = req.body;
  try {
    const existingemail = await User.findOne({ Email: Email });
    const existingusername = await User.findOne({ Username: Username });
    const existingnumber = await User.findOne({ Number: Number });

    if (Username.length == 0) {
      res.locals.error = await req.flash("error", "provide username ");
    }
    if (existingusername) {
      res.locals.error = await req.flash("error", "username alredy exists");
    }
    if (Email.length == 0) {
      res.locals.error = await req.flash("error", "provide Email ");
    }
    if (existingemail) {
      res.locals.error = await req.flash("error", "Email alredy exists");
    }
    if (Number.length !== 10) {
      res.locals.error = await req.flash("error", "provide valid number");
    }
    if (existingnumber) {
      res.locals.error = await req.flash("error", "number alredy exists");
    }
  } catch (error) {
    res.locals.error = await req.flash("error", "something went wrong");
  }

  // hasing password
  const hashpassword = await bcrypt.hash(Password, 10);

  // creating user

  // dp clour
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);

  let data = {
    Username: Username,
    Email: Email,
    Profile: Profile,
    Number: Number,
    Password: hashpassword,
    Dp: randomColor,
  };
  let newuser = new User(data);

  try {
    const add = await newuser.save();
    if (add) {
      res.locals.error = await req.flash("error", "signup succesfull");
    }
  } catch (error) {}
  req.session.save(() => {
    res.redirect("/");
  });
};

// login controller
const login = async (req, res) => {
  // find user
  const { username, password } = req.body;
  const existinguser = await User.findOne({ Username: username });

  if (existinguser) {
    // comparing two passwords
    const matchpass = await bcrypt.compare(password, existinguser.Password);
    if (!matchpass) {
      res.locals.error = await req.flash("error", "incorrect password");
    }

    if (existinguser && matchpass) {
      req.session.existinguser = {
        username: req.body.username,
        email: existinguser.Email,
        id: existinguser._id,
        Dp: existinguser.Dp,
      };
      req.session.save(() => {
        res.redirect("/login");
      });
    } else {
      req.session.save(() => {
        res.redirect("/");
      });
    }
  } else {
    res.locals.error = await req.flash("error", "user not found");
    req.session.save(() => {
      res.redirect("/");
    });
  }
};
// logout controller

const logout = async (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

// create post controller

const createpost = async (req, res) => {
  try {
    const auther = req.session.existinguser.username;
    const postdata = {
      tittle: req.body.tittle,
      discription: req.body.discription,
      auther: auther,
    };
    const newpost = new Post(postdata);

    await newpost.save();
    res.redirect(`/posts/${newpost.id}`);
  } catch (error) {
    console.log(error);
  }
};

// single post controller
const posts = async (req, res) => {
  const id = req.params.id;
  const post = await Post.findOne({ _id: id });
  const data = { posts: post, user: req.session.existinguser };
  res.render("singlepost", data);
};

// profile page controller
const profile = async (req, res) => {
  const user1 = await User.findOne({ Username: req.params.user });
  const posts = await Post.find({ auther: user1.Username });

  let followerslist = [];
  let followinglist = [];

  await Promise.all(
    user1.following.map(async (data) => {
      let user = await User.findById(data);
      followinglist.push(user);
    })
  );
  await Promise.all(
    user1.followers.map(async (data) => {
      let user = await User.findById(data);
      followerslist.push(user);
    })
  );

  let data = {
    users: user1,
    user: req.session.existinguser,
    posts: posts,
    followerslist: followerslist,
    following: followinglist,
  };
  try {
    res.render("profile", data);
  } catch (error) {
    res.render("404");
  }
};

// delete post controller

const delepost = async (req, res) => {
  const id = req.params.id;
  try {
    await Post.deleteOne({ _id: id });
    location.reload();
  } catch (error) {
    console.log(error);
  }
};
// edit post controller
const editpost = async (req, res) => {
  const id = req.params.id;

  let post = await Post.findById(id);

  const data = { user: req.session.existinguser, post: post };
  try {
    res.render("editpost", data);
  } catch (error) {
    console.log(error);
  }
};
// updatepost controller

const updatepost = async (req, res) => {
  let id = req.params.id;
  await Post.findByIdAndUpdate(id, req.body);
  res.redirect("/login");
};

// search controller

const search = async (req, res) => {
  try {
    let searchval = req.body.search;
    if (searchval.length == 0) {
      res.redirect("/login");
    }
    const posts = await Post.find();
    const users = await User.find();
    let sdata = posts.concat(users);
    let searchoutput = sdata.filter(
      (data) =>
        `${data.auther}`.includes(searchval) ||
        `${data.tittle}`.includes(searchval) ||
        `${data.Profile}`.includes(searchval)
    );

    const data = { searchoutput: searchoutput, user: req.session.existinguser };
    res.render("search", data);
  } catch (error) {
    console.log(error);
  }
};

// follow controller
const follow = async (req, res) => {
  let id = req.params.id;
  let userid = req.session.existinguser.id;

  await User.findByIdAndUpdate({ _id: id }, { $push: { followers: userid } });
  await User.findByIdAndUpdate({ _id: userid }, { $push: { following: id } });
  res.redirect("/login");
};

// unfollow controller
const unfollow = async (req, res) => {
  let id = req.params.id;
  let userid = req.session.existinguser.id;

  await User.findByIdAndUpdate({ _id: id }, { $pull: { followers: userid } });
  await User.findByIdAndUpdate({ _id: userid }, { $pull: { following: id } });
  res.redirect("/login");
};

// edit profile

const editprofile = async (req, res) => {
  const id = req.params.id;

  let userdata = await User.findById(id);

  const data = {
    user: req.session.existinguser,
    userdata: userdata,
    data: req.flash("error"),
  };
  try {
    res.render("editprofile", data);
  } catch (error) {
    console.log(error);
  }
};

// update  profile

const updateprofile = async (req, res) => {
  let id = req.params.id;

  try {
    await User.findByIdAndUpdate(id, req.body);
    req.session.destroy(() => {
      res.redirect("/");
    });
  } catch (err) {
    console.log(err);
  }
};
module.exports = {
  login,
  signup,
  home_login,
  home_welcome,
  logout,
  newpost,
  createpost,
  posts,
  profile,
  delepost,
  search,
  editpost,
  updatepost,
  follow,
  unfollow,
  editprofile,
  updateprofile,
};

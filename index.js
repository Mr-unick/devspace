const express = require("express");

const { connection } = require("./db/conn");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const router = new express.Router();
const pass = "r1r0y3RbPyiPOS45";
const app = express();
const flash = require("connect-flash");
const port = process.env.PORT || 4000;
const { authentication } = require("./views/auth");
const {
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
} = require("./controller");
connection();
app.set("view engine", "ejs");

// login  session

const loginsession = session({
  secret: "devspace",
  store: new MongoStore({
    mongoUrl: `mongodb+srv://nikhillende9121:${pass}@cluster1.s0yatl5.mongodb.net/test`,
    autoRemove: "native",
  }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 10, httpOnly: true },
});
// middlewares

app.use(flash());
app.use(loginsession);
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
app.use(router);
app.use(authentication);

// routes

router.get("/", home_login);
router.post("/", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/login", authentication, home_welcome);

// post routes

router.get("/newpost", authentication, newpost);
router.get("/posts/:id", authentication, posts);
router.post("/createpost", authentication, createpost);
router.post("/deletepost/:id", authentication, delepost);
router.get("/editpost/:id", authentication, editpost);
router.post("/updatepost/:id", authentication, updatepost);

// profile routes

router.get("/profile/:user", authentication, profile);

// search routes

router.post("/search", authentication, search);

// follow unfollow routes
router.post("/follow/:id", authentication, follow);
router.post("/unfollow/:id", authentication, unfollow);
// editprofile
router.get("/editprofile/:id", authentication, editprofile);
router.post("/updateprofile/:id", authentication, updateprofile);

app.listen(port, (req, res) => {
  console.log("server started");
});

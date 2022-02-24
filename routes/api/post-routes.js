const router = require("express").Router();
const { Post, User, Vote } = require("../../models");
const sequelize = require('../../config/connection');

/// get all posts ///
router.get("/", (req, res) => {
  console.log("======================");
  Post.findAll({
    attributes: ["id", "post_url", "title", "created_at"],
    order: [['created_at', 'DESC']],
    include: [
      {
        model: User,
        attributes: ["username"],
      },
    ],
  })
    .then((dbPostData) => res.json(dbPostData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

///  get a single post  ///
router.get("/:id", (req, res) => {
  Post.findOne({
    where: {
      id: req.params.id,
    },
    attributes: ["id", "post_url", "title", "created_at"],
    include: [
      {
        model: User,
        attributes: ["username"],
      },
    ],
  })
    .then((dbPostData) => {
      if (!dbPostData) {
        res.status(404).json({ message: "No post found with that id" });
        return;
      }
      res.json(dbPostData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

///  create a post  ///
router.post("/", (req, res) => {
  //expects {title: 'Taskmaster goes public!', post_url: 'https://taskmaster.com/press', user_id: 1}
  Post.create({
    title: req.body.title,
    post_url: req.body.post_url,
    user_id: req.body.user_id,
  })
    .then((dbPostData) => res.json(dbPostData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

/////  PUT /api/posts/upvote ///// (create the vote) MUST be before PUT("/:id")
router.put('/upvote', (req, res) => {
  Vote.create({
    user_id: req.body.user_id,
    post_id: req.body.post_id
  }).then(() => {
    //then find the post we just voted on
    return Post.findOne({
      where: {
        id: req.body.post_id
      },
      attributes: [
        'id',
        'post_url',
        'title',
        'created_at',
        //use raw MySQL aggregate function query to get a count of how manyvotes the post has and return it under the name `vote_count`
        [
          sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post_id = vote.post_id)'),
          'vote_count'
        ]
      ]
    })
  })
  .then(dbPostData => res.json(dbPostData))
  .catch(err => res.json(err));
});

///  put route (update post)  ///
router.put("/:id", (req, res) => {
  Post.update(
    {
      title: req.body.title,
    },
    {
      where: {
        id: req.params.id,
      },
    }
  )
    .then((dbPostData) => {
      if (!dbPostData) {
        res.status(404).json({ message: "No post found with this id" });
        return;
      }
      res.json(dbPostData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});



///  delete a post  ///
router.delete('/:id', (req, res) => {
    Post.destroy({
        where: {
            id: req.params.id
        }
    })
    .then(dbPostData => {
        if (!dbPostData) {
            res.status(404).json({ message: 'No post found with this id' });
            return;
        }
    })
})

module.exports = router;

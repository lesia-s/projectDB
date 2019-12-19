const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');

const models = require('../models');

// POST is register
router.post('/register', (req, res) => {

  const login = req.body.login;
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;

  if (!login || !password || !passwordConfirm) {

    const fields = [];
    if (!login) fields.push('login');
    if (!password) fields.push('password');
    if (!passwordConfirm) fields.push('passwordConfirm');
  
    res.json({
      ok: false,
      error: 'Empty fields!',
      fields
    });
  } else if (!/^[a-zA-Z0-9]+$/.test(login)) {
    res.json({
        ok: false,
        error: 'Just latin symbols and numbers!',
        fields: ['login']
      });
  } else if (login.length < 3 || login.length > 16) {
    res.json({
      ok: false,
      error: 'Login length from 3 to 16 symbols!',
      fields: ['login']
    });
  } else if (password !== passwordConfirm) {
    res.json({
      ok: false,
      error: 'Different passwords!',
      fields: ['password', 'passwordConfirm']
    });
  } else if (password.length < 5) {
    res.json({
      ok: false,
      error: 'Minimum password length is 5 symbols!',
      fields: ['password', 'passwordConfirm']
    });
  } else {
    models.User.findOne({
      login
    }).then(user => {
      if (!user) {
        bcrypt.hash(password, null, null, (err, hash) => {
          models.User.create({
            login,
            password: hash
          })
            .then(user => {
              console.log(user);
              req.session.userId = user.id;
              req.session.userLogin = user.login;
              res.json({
                ok: true
              });
            })
            .catch(err => {
              console.log(err);
              res.json({
                ok: false,
                error: 'Error, try later!'
              });
            });
        });
      } else {
        res.json({
          ok: false,
          error: 'Such login already exists!',
          fields: ['login']
        });
      }
    });
  }
});

// POST is register
router.post('/login', (req, res) => {
    const login = req.body.login;
    const password = req.body.password;
    if (!login || !password) {

        const fields = [];
        if (!login) fields.push('login');
        if (!password) fields.push('password');

        res.json({
          ok: false,
          error: 'Empty fields!',
          fields
        });
      } else {
          models.User.findOne({
              login
          }).then(user => {
              if (!user) {
                res.json({
                    ok: false,
                    error: 'Wrong password and login!',
                    fields: ['login', 'password']
                  });
              } else {
                  bcrypt.compare(password, user.password, function(err, result) {
                      if (!result) {
                        res.json({
                            ok: false,
                            error: 'Wrong password and login!',
                            fields: ['login', 'password']
                          });
                      } else {
                        req.session.userId = user.id;
                        req.session.userLogin = user.login;
                          res.json({
                            ok: true,
                          });
                      }
                  });
              }
          })
          .catch(err => {
            console.log(err);
            res.json({
              ok: false,
              error: 'Error, try later!'
            });
          });
      }
});

//GET for logout
router.get('/logout', (req, res) => {
    if (req.session) {
        //delete session object
        req.session.destroy(() => {
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
});

module.exports = router;
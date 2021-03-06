var queryCreator = require('./queryCreator');
var helpers = require('./helpers');

function initHooks(){

  let build = function(req,res,context,next){
    let obj = queryCreator.fabricateQuery(req,context.options);
    context.query = obj.query;
    context.model = obj.model;
    next();
  }

  return {
    start:null,
    build:build,
    before:null,
    data:null,
    action:null,
    sent:null,
  }
}

function buildUpdate(){
    let hooks = initHooks();

    hooks.data = function(req,res,context,next){
      context.query.where[context.options.primaryKey] = req.params[context.options.paramName];
      context.model.update(req.body,context.query).then((result)=>{
        context.result = result;
        next();
      }).catch((err)=>{
        context.error = err;
        next();
      });
    }
    hooks.action = function(req,res,context,next){
      if (context.result==0){
        res.status(404).send({message:"Not found"});
      } else if (context.result){
        res.send({rowsModified:context.result});
      } else {
        res.status(400).send(context.error);
      }
      next();
    }

    return hooks;
}
function buildDelete(){
    let hooks = initHooks();

    hooks.data = function(req,res,context,next){
      context.query.where[context.options.primaryKey] = req.params[context.options.paramName];
      context.model.destroy(context.query).then((result)=>{
        context.result = result;
        next();
      }).catch((err)=>{
        context.error = err;
        next();
      });
    }
    hooks.action = function(req,res,context,next){
      if (context.result==0){
        res.status(404).send({message:"Not found"});
      } else if (context.result){
        res.send({rowsModified:context.result});
      } else {
        res.status(400).send(context.error);
      }
      next();
    }
    return hooks;
}

function buildRead(){
    let hooks = initHooks();

    hooks.data = function(req,res,context,next){
      context.query.where[context.options.primaryKey] = req.params[context.options.paramName];
      context.model.findOne(context.query).then((result)=>{
        context.result = result;
        next();
      }).catch((err)=>{
        console.log(err);
        context.error = err;
        next();
      });
    }
    hooks.action = function(req,res,context,next){
      if (context.result){
        if (context.result.data===""){
          res.status(400).send({message:"Not found"});
        } else {
          res.send(context.result);
        }
      } else {
        res.status(400).send(context.error);
      }
      next();
    }
    return hooks;
}

function buildCreate(){
    let hooks = initHooks();

    hooks.build = null;

    hooks.data = function(req,res,context,next){
      context.model.create(req.body).then((result)=>{
        context.result = result;
        next();
      }).catch((err)=>{
        context.error = err;
        next();
      });
    }

    hooks.action = function(req,res,context,next){
      if (context.result){
        res.send(context.result);
      } else {
        res.status(400).send(context.error);
      }
      next();
    }
    return hooks;
}

function buildList(){
    let hooks = initHooks();

    hooks.data = function(req,res,context,next){
      context.model.findAll(context.query).then((results)=>{
        context.results = results;
        next();
      }).catch((err)=>{
        context.error = err;
        next();
      });
    }
    hooks.action = function(req,res,context,next){
      if (context.results){
        res.send(context.results);
      } else {
        res.status(400).send(context.error);
      }
      next();
    }
    return hooks;
}

module.exports={
  buildList:buildList,
  buildCreate:buildCreate,
  buildUpdate:buildUpdate,
  buildRead:buildRead,
  buildDelete:buildDelete,
};

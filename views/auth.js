

const authentication= (req,res,next)=>{
    if(req.session.existinguser){
        next();
    }else{
res.locals.error =  req.flash('error','you must login first');
req.session.save(()=>{res.redirect("/")});
    }
};

module.exports={authentication};

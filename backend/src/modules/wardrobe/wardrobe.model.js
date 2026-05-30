const mongoose=
require('mongoose');

const wardrobeSchema=
new mongoose.Schema({

userId:{

 type:
 mongoose.Schema.Types
 .ObjectId,

 ref:'User',

 required:true

},

name:{
 type:String,
 required:true
},

category:{

 type:String,

 enum:[
 'top',
 'bottom',
 'shoe'
 ],

 required:true

},

imageUrl:{
 type:String,
 required:true
},

cloudinaryId:{
 type:String,
 required:true
}

},
{
 timestamps:true
});

module.exports=
mongoose.model(
'Wardrobe',
wardrobeSchema
);
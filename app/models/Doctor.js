var mongoose = require('mongoose');
var mysql = require('mysql')
var bcrypt = require('bcrypt-nodejs')
var Schema = mongoose.Schema;

var DoctorSchema = new Schema({
  email: { type: String, required: true, index: { unique: true }},
  password: { type: String, required: true, select: false},
  role: { type: String, required: true}
});

DoctorSchema.pre('save', function(next){
  var doctor = this;

  if(!doctor.isModified('password')) return next();

  bcrypt.hash(doctor.password, null, null, function(err, hash){
    if(err) return next(err);

    doctor.password = hash;
    next();
  });
});

DoctorSchema.methods.comparePassword = function(password){
  var doctor = this;

  return bcrypt.compareSync(password, doctor.password);
}

module.exports = mongoose.model('doctor', DoctorSchema);
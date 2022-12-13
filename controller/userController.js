const userDB = require("../model/userModel")
const bcrypt = require("bcrypt")
const validator = require("email-validator")
const express = require("express")
var mobileNoRegEx = /^[7-9]{1}[0-9]{9}$/
var passwordRegEx = /^([A-Z][a-z]+)([!@#\$&*])([0-9])+/




const userSignup = async (req, res) => {
    const { firstName, lastName, email, mobileNumber, countryCode, password, address, dateOfBirth } = req.body


    if (firstName && lastName && email && mobileNumber && countryCode && password && address && dateOfBirth) {
        console.log(firstName + "\n" + lastName + "\n" + email + "\n" + mobileNumber + "\n" + countryCode + "\n" + password + "\n" + address + "\n" + dateOfBirth);

        if (validator.validate(email)) {
            let email1 = await userDB.findOne({ email: email })
            if (mobileNoRegEx.test(mobileNumber)) {
                let mobno = await userDB.findOne({ mobileNumber: mobileNumber })
                if (email1) {
                    res.send("Emaild id is aleady registered kindly enter new email id.")

                } else if (mobno) {
                    res.send("Mobile no is aleady registered kindly enter new Mobile No.")
                } else if (!email1 && !mobno) {
                    const type = "USER"
                    if (passwordRegEx.test(password)) {
                        const salt = await bcrypt.genSalt(10);
                        const hashpass = await bcrypt.hash(password, salt)

                        const doc = new userDB({
                            firstName: firstName,
                            lastName: lastName,
                            email: email,
                            mobileNumber: mobileNumber,
                            countryCode: countryCode,
                            password: hashpass,
                            address: address,
                            dateOfBirth: dateOfBirth,
                            userType: type
                        })

                        await doc.save();
                        console.log("Data saved successfully");
                   
                        return res.status(200).send({ status: "Success", message: "User registered successfully" });
                    } else {
                        return res.send("Entered password is not in correct formar, Example-> Sample@123 ")
                    }

                } else {
                    return res.send("You enter incorrect Email ID.")
                }
            } else {
                res.send("Mobile No is not valid")
            }

        } else {
            return res.send("User Already exist")
        }
    } else {
        return res.status(400).send({ status: "Error", message: "All fields are required" })
    }
}

const updateProfile = async (req, res) => {
    const {userId} = req.params
    console.log("Param user ID",userId);
    const { firstName, lastName, email, mobileNumber, password, address, dateOfBirth } = req.body

    if(!firstName || !lastName || !email || !mobileNumber || !password || !address || !dateOfBirth){
        return res.status(400).send("All fields mendatory.")
    }

    if(!validator.validate(email)){
        return res.status(400).send("You entered incorrect email id.")
    }

    if (!passwordRegEx.test(password)){
        return res.send("Entered password is not in correct formar, Example-> Sample@123 ")
    }
    
    if (!mobileNoRegEx.test(mobileNumber)) {
        return res.send("Mobile No is not valid")
    }

    const checkUser = await userDB.findOne({ _id: userId });
    console.log("Database User",checkUser);

    if (!checkUser) {
        return res.status(400).json({ "staus": false, "message": "User not found" })
    }
    const salt = await bcrypt.genSalt(10);
    const hashpass = await bcrypt.hash(password, salt)

    await userDB.findByIdAndUpdate({ _id: userId }, {
        $set:
        {
            firstName: firstName,
            lastName: lastName,
            email: email,
            mobileNumber: mobileNumber,
            password: hashpass,
            address: address,
            dateOfBirth: dateOfBirth

        }

    }).then(()=>{
        return res.status(200).json({ "staus": false, "message": "Profile Updated successfully!" })
    });

}
const viewUser = async (req, res) => {
    const { email } = req.query
    console.log(email);
    if (validator.validate(email)) {
        const findUser = await userDB.findOne({ email: email })
        console.log(findUser);
        return res.status(200).send(findUser)
    } else {
        return res.send("You entered incorrect Email id.")
    }
}

const deleteUser = async(req,res) =>{
    const {userId} = req.params

    userData = await userDB.findOneAndDelete({ _id : userId })
    console.log("Data deleted.");
    userList = await userDB.find()
    console.log("User List", userList);
    res.status(200).send({ status : "Success", message : "User Deleted successfully ! Remaining users are-" , result : userList})

}

module.exports = {
    userSignup,
    updateProfile,
    viewUser,
    deleteUser
}
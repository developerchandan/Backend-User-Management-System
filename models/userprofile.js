const { string } = require('joi');
const mongoose = require('mongoose');

const userProfile = mongoose.Schema({

    ResumeHeadline: {
        Headline: String,
    },
    KeySkills: [{
        keyvalue: String,
    }],
    AddEmployment: [{
        YourDesignation: String,
        YourOrganization: String,
        CurrentCompany: String,
        workingFrom: String,
        WorkedTill: String,
        JobProfile: String
    }],
    Education: [{
        Educations: String,
        Course: String,
        University: String
    }],
    ITSkills: [{
        Skills: String,
        Version: String,
        LastUsed: String,
        Experience: String
    }],
    Projects: [{
        ProjectTitle: String,
        EmploymentEducation: String,
        Client: String,
        ProjectStatus: String,
        StartedWorkingFrom: String,
        WorkedTill: String,
        DetailsOfProject: String
    }],
    ProfileSummary: {
        Summary: String
    },
    DesiredCareerProfile: {
        Industry: String,
        FunctionalArea: String,
        Role: String,
        JobType: String,
        EmploymentType: String,
        DesiredShift: String,
        AvailabilityToJoin: String,
        ExpectedSalary: String,
        DesiredLocation: String,
        DesiredIndustry: String
    },
    PersonalDetails: {
        DateOfBirth: String,
        PermanentAddress: String,
        Gender: String,
        AreaPinCode: String,
        MaritalStatus: String,
        Hometown: String,
        PassportNumber: String,
        WorkPermit: String,
        Language: String,
        DifferentlyAbled: String
    },
    AttachResume: {
        resume: String
    }

})

userProfile.virtual('id').get(function () {
    return this._id.toHexString();
});

userProfile.set('toJSON', {
    virtuals: true,
});

exports.Profile = mongoose.model('Profile', userProfile);
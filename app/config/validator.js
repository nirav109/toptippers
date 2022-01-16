(function() {
    'use strict';

    module.exports = {
        isValid: isValid,
        isValidObject: isValidObject,
        getFileExtension: getFileExtension,
        isValidContact: isValidContact,
        isEmail: isEmail,
        isPhoneNumber: isPhoneNumber,
        isZipCode: isZipCode,
        isValidName: isValidName,
        isJSON: isJSON,
        isValidObjectWithKeys: isValidObjectWithKeys,
        extractNameFromEmail: extractNameFromEmail
    }

    /* @function : isValid
     * @param    : data {string}
     * @created  : 06022018
     * @modified : 06022018
     * @purpose  : To validate provided data
     * @return   : 401 or 401 or 200
     * @public
     */
    function isValid(data) {
        if (data && data !== null && data !== undefined) {
            return true;
        } else {
            return false;
        }
    }

    /* @function : isValidObject
     * @param    : _Object {object}
     * @created  : 24022018
     * @modified : 06022018
     * @purpose  : To validate provided data
     * @return   : 401 or 401 or 200
     * @public
     */
    function isValidObject(_Object) {
        if (isJSON(_Object)) {
            for (var obj in _Object) {
                if (isJSON(_Object[obj])) {
                    for (var _arr in _Object[obj]) {
                        if (_Object[obj][_arr] === null || _Object[obj][_arr] === '')
                            delete _Object[obj][_arr];
                    }
                    if (!isJSON(_Object[obj]))
                        delete _Object[obj];
                } else {
                    if (_Object[obj] === null || _Object[obj] === '')
                        delete _Object[obj];
                    if (Array.isArray(_Object[obj]) && _Object[obj].length == 0)
                        delete _Object[obj];
                }
            }
        }
        return _Object;
    }

    function isJSON(_obj) {
        var _has_keys = 0;
        for (var _pr in _obj) {
            if (_obj.hasOwnProperty(_pr) && !(/^\d+$/.test(_pr))) {
                _has_keys = 1;
                break;
            }
        }
        return (_has_keys && _obj.constructor == Object && _obj.constructor != Array) ? 1 : 0;
    }

    /* @function : getFileExtension
     * @param    : File
     * @created  : 21032018
     * @modified : 21032018
     * @purpose  : To validate file type and return file
     * @return   : File type
     * @public
     */
    function getFileExtension(_FILE) {
        var _n = (isValid(_FILE.name)) ? _FILE.name.split('.')[1] : _FILE.name;
        var _ext = _FILE.type;
        // CSS Check
        if (((_ext === 'text/comma-separated-values') || (_ext === 'text/csv') || (_ext === 'application/csv') || (_ext === 'application/excel') || (_ext === 'application/vnd.ms-excel') || (_ext === 'application/vnd.msexcel')) && (_n === 'csv'))
            return 'csv';
        // XLS Check 
        if (((_ext === 'application/vnd.ms-excel') || (_ext === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || (_ext === 'application/msexcel') || (_ext === 'application/x-msexcel') || (_ext === 'application/x-ms-excel') || (_ext === 'application/vnd.ms-excel') || (_ext === 'application/x-excel') || (_ext === 'application/x-dos_ms_excel') || (_ext === 'application/xls')) && (_n === 'xls' || _n === 'xlsx'))
            return 'xls';
        // XML Check 
        if (((_ext === 'text/xml') || (_ext === 'application/xml') || (_ext === 'application/x-xml')) && (_n === 'xml'))
            return 'xml';
        else
            return 'invalid';
    }

    /* @function : isValidContact
     * @param    : Contact
     * @created  : 22032018
     * @modified : 22032018
     * @purpose  : To validate contact and return contact object
     * @return   : Contact Object
     * @public
     */
    function isValidContact(contacts) {
        var rows = [];
        var _records = [];
        contacts.forEach(function(contact, index) {
            contact = isValidObject(contact);
            var flag = 0;
            if (isJSON(contact)) {
                // Email check
                if (!(contact.Email && isEmail(contact.Email))) {
                    flag = 1;
                }
                // First Name check
                var FirstName = contact['First Name'] || contact['FirstName'];
                if (!(FirstName && FirstName.toString().length < 30 && isValidName(FirstName))) {
                    flag = 1;
                }
                // Last Name Check
                var LastName = contact['Last Name'] || contact['LastName'];
                if (!(LastName && LastName.toString().length < 30 && isValidName(LastName))) {
                    flag = 1;
                }
                // Zipcode check
                if (!(contact.Zipcode && isZipCode(contact.Zipcode))) {
                    flag = 1;
                }
                // Phone number check
                var phone = contact['Phone No'] || contact['Phone'];
                if (phone) {
                    if (!(isPhoneNumber(phone)))
                        flag = 1;
                }
                // Birthdate check
                var _dob = contact['Date of Birth'] || contact['DOB'];
                var _anni = contact['Anniversary Date'] || contact['AnniversaryDate'];
                if (_dob) {
                    if (!(calculateAge(new Date(), new Date(_dob)) > 18))
                        flag = 1;
                }
                // Anniversary check
                if (_anni) {
                    if (!(calculateAge(new Date(_dob), new Date(_anni)) > 18))
                        flag = 1;
                }
                // Final flag check
                if (flag) {
                    rows.push(index + 2);
                }
                _records.push(contact);
            }
        });
        return (rows.length !== 0) ? {
            'status': false,
            'rows': rows
        } : {
            'status': true,
            'contacts': _records
        };
    }

    /* @function : isEmail
     * @param    : Email
     * @created  : 22032018
     * @modified : 22032018
     * @purpose  : To validate email and return status
     * @return   : Status : true, false
     * @public
     */
    function isEmail(email) {
        return /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i.test(email);
    }

    /* @function : isPhoneNumber
     * @param    : Phone Number
     * @created  : 22032016
     * @modified : 22032016
     * @purpose  : To validate phone number and return status
     * @return   : Status : true, false
     * @public
     */
    function isPhoneNumber(phone) {
        return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(phone);
    }

    /* @function : calculateAge
     * @param    : Two dates
     * @created  : 22032018
     * @modified : 22032018
     * @purpose  : To validate dob and anniversary date
     * @return   : age number
     * @public
     */
    function calculateAge(current, date) {
        var ageDifMs = current.getTime() - date.getTime();
        var ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    /* @function : isZipCode
     * @param    : zipcode
     * @created  : 22032018
     * @modified : 22032018
     * @purpose  : To validate zipcode
     * @return   : true, false
     * @public
     */
    function isZipCode(zipcode) {
        return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zipcode);
    }

    /* @function : isValidName
     * @param    : Name
     * @created  : 22032016
     * @modified : 22032016
     * @purpose  : To validate name
     * @return   : true, false
     * @public
     */
    function isValidName(name) {
        return /^[a-zA-Z\s]*$/.test(name);
    }


    function isValidObjectWithKeys(_Object, keys) {
        let success = true;
        console.log(typeof _Object)
        if (typeof _Object == "object" && keys && keys.length) {
            for (let i = 0; i < keys.length; i++) {
                if (_Object.hasOwnProperty(keys[i])) continue;
                else {
                    success = false;
                    break;
                }
            }
        } else success = false;
        return success;
    }
})();

/* @function : extractNameFromEmail
 * @param    : email
 * @created  : 23012020
 * @modified : 23012020
 * @purpose  : To get username
 * @return   : string
 * @public
 */
function extractNameFromEmail(email) {
    var nameMatch = email.match(/^([^@]*)@/);
    var name = nameMatch ? nameMatch[1] : null;
    return name;
}
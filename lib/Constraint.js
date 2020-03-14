/*
 * Copyright 2013-2020 Erudika. https://erudika.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * For issues and patches go to: https://github.com/erudika
 */
'use strict';

module.exports = Constraint;

/**
 * Represents a validation constraint.
 * @author Alex Bogdanovski [alex@erudika.com]
 * @param {String} constraintName name
 * @param {Object} constraintPayload payload
 * @returns {Constraint}
 */
function Constraint(constraintName, constraintPayload) {
	var name = constraintName;
	var payload = constraintPayload;

	/**
	 * The constraint name.
	 * @returns {String} a name
	 */
	this.getName = function () {
		return name;
	};

	/**
	 * Sets the name of the constraint.
	 * @param {String} n name
	 */
	this.setName = function (n) {
		name = n;
	};

	/**
	 * The payload (a map)
	 * @returns {Object} an object
	 */
	this.getPayload = function () {
		return payload;
	};

	/**
	 * Sets the payload.
	 * @param {Object} p the payload object
	 */
	this.setPayload = function (p) {
		payload = p;
	};
}

/**
 * The 'required' constraint - marks a field as required.
 * @returns {Constraint}
 */
Constraint.required = function () {
	return new Constraint("required", {"message": "messages.required"});
};

/**
 * The 'min' constraint - field must contain a number larger than or equal to min.
 * @param {Number} min the minimum value
 * @returns {Constraint}
 */
Constraint.min = function (min) {
	return new Constraint("min", {
		"value": min || 0,
		"message": "messages.min"
	});
};

/**
 * The 'max' constraint - field must contain a number smaller than or equal to max.
 * @param {Number} max the maximum value
 * @returns {Constraint}
 */
Constraint.max = function (max) {
	return new Constraint("max", {
		"value": max || 0,
		"message": "messages.max"
	});
};

/**
 * The 'size' constraint - field must be a String, Object or Array
 * with a given minimum and maximum length.
 * @param {Number} min the minimum length
 * @param {Number} max the maximum length
 * @returns {Constraint}
 */
Constraint.size = function (min, max) {
	return new Constraint("size", {
		"min": min || 0,
		"max": max || 0,
		"message": "messages.size"
	});
};

/**
 * The 'digits' constraint - field must be a Number or String containing digits where the
 * number of digits in the integral part is limited by 'integer', and the
 * number of digits for the fractional part is limited
 * by 'fraction'.
 * @param {Number} i the max number of digits for the integral part
 * @param {Number} f the max number of digits for the fractional part
 * @returns {Constraint}
 */
Constraint.digits = function (i, f) {
	return new Constraint("digits", {
		"integer": i || 0,
		"fraction": f || 0,
		"message": "messages.digits"
	});
};

/**
 * The 'pattern' constraint - field must contain a value matching a regular expression.
 * @param {String} regex a regular expression
 * @returns {Constraint}
 */
Constraint.pattern = function (regex) {
	return new Constraint("pattern", {
		"value": regex || "",
		"message": "messages.pattern"
	});
};

/**
 * The 'email' constraint - field must contain a valid email.
 * @returns {Constraint}
 */
Constraint.email = function () {
	return new Constraint("email", {"message": "messages.email"});
};

/**
 * The 'falsy' constraint - field value must not be equal to 'true'.
 * @returns {Constraint}
 */
Constraint.falsy = function () {
	return new Constraint("false", {"message": "messages.false"});
};

/**
 * The 'truthy' constraint - field value must be equal to 'true'.
 * @returns {Constraint}
 */
Constraint.truthy = function () {
	return new Constraint("true", {"message": "messages.true"});
};

/**
 * The 'future' constraint - field value must be a Date or a timestamp in the future.
 * @returns {Constraint}
 */
Constraint.future = function () {
	return new Constraint("future", {"message": "messages.future"});
};

/**
 * The 'past' constraint - field value must be a Date or a timestamp in the past.
 * @returns {Constraint}
 */
Constraint.past = function () {
	return new Constraint("past", {"message": "messages.past"});
};

/**
 * The 'url' constraint - field value must be a valid URL.
 * @returns {Constraint}
 */
Constraint.url = function () {
	return new Constraint("url", {"message": "messages.url"});
};

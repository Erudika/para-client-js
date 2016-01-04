/*
 * Copyright 2013-2015 Erudika. http://erudika.com
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

var _ = require('lodash');
var assert = require('assert');
var RSVP = require('rsvp');
var ParaClient = require('../lib');
var ParaObject = require('../lib/ParaObject');
var Pager = require('../lib/Pager');
var Constraint = require('../lib/Constraint');

var pc;
var catsType = "cat";
var dogsType = "dog";

var u;
var u1;
var u2;
var t;
var s1;
var s2;
var a1;
var a2;

describe('ParaClient tests', function () {
	this.timeout(0);

	before(function (done) {
		pc = new ParaClient("app:para", "ThpORpZ35uIJqT8rfOCb9t/5/doGbIUgmeGwO5jjyop85xyOXhx7Pg==");
		pc.endpoint = "http://localhost:8080";

		pc.me().then(function () {}, function (err) {
			done(new Error("Para server must be running before testing!\n" + err.response.res.text));
		});

		u = new ParaObject("111");
		u.setName("John Doe");
		u.setTags(["one", "two", "three"]);

		u1 = new ParaObject("222");
		u1.setName("Joe Black");
		u1.setTags(["two", "four", "three"]);

		u2 = new ParaObject("333");
		u2.setName("Ann Smith");
		u2.setTags(["four", "five", "three"]);

		t = new ParaObject("tag:test", "tag");
		t.tag = "test";
		t.count = 3;

		a1 = new ParaObject("adr1", "address");
		a1.setName("Place 1");
		a1.setParentid(u.getId());
		a1.setCreatorid(u.getId());
		a1.address = "NYC";
		a1.country = "US";
		a1.latlng = "40.67,-73.94";

		a2 = new ParaObject("adr2", "address");
		a2.setName("Place 2");
		a2.setParentid(t.getId());
		a2.setCreatorid(t.getId());
		a2.address = "NYC";
		a2.country = "US";
		a2.latlng = "40.69,-73.95";

		s1 = new ParaObject("s1");
		s1.setName("This is a little test sentence. Testing, one, two, three.");

		s2 = new ParaObject("s2");
		s2.setName("We are testing this thing. This sentence is a test. One, two.");

		pc.createAll([u, u1, u2, t, s1, s2, a1, a2]).then(function (res) {
			done();
		}, function (err) {
			done(err);
		});
	});

	it('should pass CRUD tests', function (done) {
		var t1;
		var tr;
		pc.create(null, function (res) {
			assert(res === null);
			return pc.read(null, null);
		}).then(function (res) {
			assert(!res);
			return pc.read("", "");
		}).then(function (res) {
			assert(!res);
			return pc.update(new ParaObject("null")).then(function () {
				assert(false);
			}, function (err) {
				assert(true);
			});
		}).then(function (res) {
			assert(!res);
			return pc.create(new ParaObject("test1", "tag"));
		}).then(function (res) {
			t1 = res;
			assert(t1);
			t1.tag = "test1";
			return pc.read(null, t1.getId());
		}).then(function (res) {
			var trID = res;
			assert(trID);
			assert(trID.getTimestamp());
			assert.strictEqual(t1.tag, trID.tag);
			return pc.read(t1.getType(), t1.getId());
		}).then(function (res) {
			tr = res;
			assert(tr);
			assert(tr.getTimestamp());
			assert.strictEqual(t1.tag, tr.tag);
			tr.count = 15;
			return pc.update(tr);
		}).then(function (res) {
			var tu = res;
			assert(tu);
			assert.strictEqual(tu.count, tr.count);
			assert(tu.getUpdated());

			var s = new ParaObject();
			s.setType(dogsType);
			s.foo = "bark!";
			return pc.create(s);
		}).then(function (s) {
			pc.read(dogsType, s.getId()).then(function (res) {
				var dog = res;
				assert(dog && dog.foo);
				assert.strictEqual("bark!", dog.foo);
				pc.delete(dog);
			});
			return pc.delete(t1);
		}).then(function (res) {
			pc.read(tr.getType(), tr.getId()).then(function (res) {
			}, function (err) {
				done();
			});
		}).catch(function (err) {
			done(new Error(err));
		});
	});

	it('should pass batch CRUD tests', function (done) {
		var dogs = [];
		for (var i = 0; i < 3; i++) {
			var s = new ParaObject();
			s.setType(dogsType);
			s.foo = "bark!";
			dogs[i] = s;
		}

		var l1;
		var l2;
		var part1;
		var part2;
		var part3;
		var nl = [];

		pc.createAll(null).then(function (res) {
			assert(_.isEmpty(res));
			return pc.createAll([]);
		}).then(function (res) {
			assert(_.isEmpty(res));
			return pc.readAll(null);
		}).then(function (res) {
			assert(_.isEmpty(res));
			return pc.readAll([]);
		}).then(function (res) {
			assert(_.isEmpty(res));
			return pc.updateAll(null);
		}).then(function (res) {
			assert(_.isEmpty(res));
			return pc.updateAll([]);
		}).then(function (res) {
			assert(_.isEmpty(res));
			return pc.createAll(dogs);
		}).then(function (res) {
			l1 = res;
			assert.strictEqual(3, l1.length);
			assert(l1[0].getId());
			nl[0] = l1[0].getId();
			nl[1] = l1[1].getId();
			nl[2] = l1[2].getId();
			return pc.readAll(nl);
		}).then(function (res) {
			l2 = res;
			assert.strictEqual(3, l2.length);
			assert.strictEqual(l1[0].getId(), l2[0].getId());
			assert.strictEqual(l1[1].getId(), l2[1].getId());
			assert(l2[0].foo);
			assert.strictEqual("bark!", l2[0].foo);

			part1 = new ParaObject(l1[0].getId());
			part2 = new ParaObject(l1[1].getId());
			part3 = new ParaObject(l1[2].getId());
			part1.setType(dogsType);
			part2.setType(dogsType);
			part3.setType(dogsType);

			part1.custom = "prop";
			part1.setName("NewName1");
			part2.setName("NewName2");
			part3.setName("NewName3");
			return pc.updateAll([part1, part2, part3]);
		}).then(function (res) {
			var l3 = res;
			assert(l3[0].custom);
			assert.strictEqual(dogsType, l3[0].getType());
			assert.strictEqual(dogsType, l3[1].getType());
			assert.strictEqual(dogsType, l3[2].getType());

			assert.strictEqual(part1.getName(), l3[0].getName());
			assert.strictEqual(part2.getName(), l3[1].getName());
			assert.strictEqual(part3.getName(), l3[2].getName());
			return pc.deleteAll(nl);
		}).then(function (res) {
			pc.list(dogsType).then(function (l4) {
				assert(_.isEmpty(l4));
			});
			return pc.getApp();
		}).then(function (app) {
			assert(_.contains(app.datatypes, dogsType));
			done();
		}).catch(function (err) {
			done(err);
		});
	});

	it('should pass batch list tests', function (done) {
		var cats = [];
		for (var i = 0; i < 3; i++) {
			var s = new ParaObject(catsType + i);
			s.setType(catsType);
			cats[i] = s;
		}
		var nl = [];
		nl[0] = cats[0].getId();
		nl[1] = cats[1].getId();
		nl[2] = cats[2].getId();

		pc.list(null).then(function (res) {
			assert(_.isEmpty(res));
			return pc.list("");
		}).then(function (res) {
			assert(_.isEmpty(res));
			return pc.createAll(cats);
		}).then(function (res) {
			return sleep(1);
		}).then(function (res) {
			return pc.list(catsType);
		}).then(function (res) {
			var list1 = res;
			assert(!_.isEmpty(list1));
			assert.strictEqual(3, list1.length);
			assert.strictEqual(catsType, list1[0].getType());
			return pc.list(catsType, new Pager(1, null, true, 2));
		}).then(function (res) {
			var list2 = res;
			assert(!_.isEmpty(list2));
			assert.strictEqual(2, list2.length);
			return pc.deleteAll(nl);
		}).then(function (res) {
			pc.getApp(function (app) {
				assert(_.includes(app.datatypes, catsType));
				done();
			});
		}).catch(function (err) {
			pc.deleteAll(nl, function () {
				done(err);
			});
		});
	});

	it('should pass the search tests', function (done) {
		var p;
		var i0;
		var i1;
		var i2;
		var i3;
		var i4;
		var i5;
		var i6;
		// many terms
		var terms = {};
		//terms["type"] = u.getType();
		terms["id"] = u.getId();
		var terms1 = {};
		terms1["type"] = null;
		terms1["id"] = " ";
		var terms2 = {};
		terms2[" "] = "bad";
		terms2[""] = "";

		pc.findById(null).then(function (res) {
			assert(!res);
			return pc.findById("");
		}).then(function (res) {
			assert(!res);
			return pc.findPrefix(null, null, "");
		}).then(function (res) {
			assert(_.isEmpty(res));
			return pc.findPrefix("", "null", "xx");
		}).then(function (res) {
			assert(_.isEmpty(res));
			return pc.findById(u.getId());
		}).then(function (res) {
			assert(res);
			return pc.findById(t.getId());
		}).then(function (res) {
			assert(res);
			return pc.findByIds(null);
		}).then(function (res) {
			assert(_.isEmpty(res));
			return pc.findByIds([u.getId(), u1.getId(), u2.getId()]);
		}).then(function (res) {
			assert.strictEqual(3, res.length);
			return pc.findNearby(null, null, 100, 1, 1);
		}).then(function (res) {
			assert(_.isEmpty(res));
			return pc.findNearby(u.getType(), "*", 10, 40.60, -73.90);
		}).then(function (res) {
			assert(!_.isEmpty(res));
			return pc.findNearby(null, null, 100, 1, 1);
		}).then(function (res) {
			assert(_.isEmpty(res));
			return pc.findNearby(u.getType(), "*", 10, 40.60, -73.90);
		}).then(function (res) {
			assert(!_.isEmpty(res));
			return pc.findPrefix(u.getType(), "name", "ann");
		}).then(function (res) {
			assert(!_.isEmpty(res));
			return pc.findQuery("", "*");
		}).then(function (res) {
			//assert(!_.isEmpty(pc.findQuery(null, null)));
			assert(!_.isEmpty(res));
			return pc.findQuery(a1.getType(), "country:US");
		}).then(function (res) {
			assert.strictEqual(2, res.length);
			return pc.findQuery(u.getType(), "ann");
		}).then(function (res) {
			assert(!_.isEmpty(res));
			return pc.findQuery(u.getType(), "Ann");
		}).then(function (res) {
			assert(!_.isEmpty(res));
			return pc.findQuery(null, "*");
		}).then(function (res) {
			assert(res.length > 4);
			p = new Pager();
			assert.strictEqual(0, p.count);
			return pc.findQuery(u.getType(), "*", p);
		}).then(function (res) {
			assert.strictEqual(res.length, p.count);
			assert(p.count > 0);
			return pc.findSimilar(t.getType(), "", null, null);
		}).then(function (res) {
			assert(_.isEmpty(res));
			return pc.findSimilar(t.getType(), "", [], "");
		}).then(function (res) {
			assert(_.isEmpty(res));
			return pc.findSimilar(s1.getType(), s1.getId(), ["name"], s1.getName());
		}).then(function (res) {
			assert(!_.isEmpty(res));
			assert.strictEqual(s2.getId(), res[0].getId());
			return pc.findTagged(u.getType(), null);
		}).then(function (res) {
			i0 = res.length;
			return pc.findTagged(u.getType(), ["two"]);
		}).then(function (res) {
			i1 = res.length;
			return pc.findTagged(u.getType(), ["one", "two"]);
		}).then(function (res) {
			i2 = res.length;
			return pc.findTagged(u.getType(), ["three"]);
		}).then(function (res) {
			i3 = res.length;
			return pc.findTagged(u.getType(), ["four", "three"]);
		}).then(function (res) {
			i4 = res.length;
			return pc.findTagged(u.getType(), ["five", "three"]);
		}).then(function (res) {
			i5 = res.length;
			return pc.findTagged(t.getType(), ["four", "three"]);
		}).then(function (res) {
			i6 = res.length;
			assert.strictEqual(0, i0);
			assert.strictEqual(2, i1);
			assert.strictEqual(1, i2);
			assert.strictEqual(3, i3);
			assert.strictEqual(2, i4);
			assert.strictEqual(1, i5);
			assert.strictEqual(0, i6);
			return pc.findTags(null);
		}).then(function (res) {
			assert(!_.isEmpty(res));
			return pc.findTags("");
		}).then(function (res) {
			assert(!_.isEmpty(res));
			return pc.findTags("unknown");
		}).then(function (res) {
			assert(_.isEmpty(res));
			return pc.findTags(t.tag);
		}).then(function (res) {
			assert(res.length >= 1);
			return pc.findTermInList(u.getType(), "id", [u.getId(), u1.getId(), u2.getId(), "xxx", "yyy"]);
		}).then(function (res) {
			assert.strictEqual(3, res.length);
			return pc.findTerms(u.getType(), terms, true);
		}).then(function (res) {
			assert.strictEqual(1, res.length);
			return pc.findTerms(u.getType(), terms1, true);
		}).then(function (res) {
			assert(_.isEmpty(res));
			return pc.findTerms(u.getType(), terms2, true);
		}).then(function (res) {
			assert(_.isEmpty(res));
			return pc.findTerms(null, null, true);
		}).then(function (res) {
			assert(_.isEmpty(res));
			return pc.findTerms(u.getType(), {"": null}, true);
		}).then(function (res) {
			assert(_.isEmpty(res));
			return pc.findTerms(u.getType(), {"": ""}, true);
		}).then(function (res) {
			assert(_.isEmpty(res));
			return pc.findTerms(u.getType(), {"term": null}, true);
		}).then(function (res) {
			assert(_.isEmpty(res));
			return pc.findTerms(u.getType(), {"type": u.getType()}, true);
		}).then(function (res) {
			assert(res.length >= 2);
			return pc.findWildcard(u.getType(), null, null);
		}).then(function (res) {
			assert(_.isEmpty(res));
			return pc.findWildcard(u.getType(), "", "");
		}).then(function (res) {
			assert(_.isEmpty(res));
			return pc.findWildcard(u.getType(), "name", "an*");
		}).then(function (res) {
			assert(!_.isEmpty(res));
			return pc.getCount(null);
		}).then(function (res) {
			assert(res > 4);
			return pc.getCount("");
		}).then(function (res) {
			assert.notEqual(0, res);
			return pc.getCount("test");
		}).then(function (res) {
			assert.strictEqual(0, res);
			return pc.getCount(u.getType());
		}).then(function (res) {
			assert(res >= 3);
			return pc.getCount(null, null);
		}).then(function (res) {
			assert.strictEqual(0, res);
			return pc.getCount(u.getType(), {"id": " "});
		}).then(function (res) {
			assert.strictEqual(0, res);
			return pc.getCount(u.getType(), {"id": u.getId()});
		}).then(function (res) {
			assert.strictEqual(1, res);
			return pc.getCount(null, {"type": u.getType()});
		}).then(function (res) {
			assert(res > 1);
			done();
		}).catch(function (err) {
			done(err);
		});
	});

	it('should pass links tests', function (done) {
		pc.link(u, t.getId()).then(function (res) {
			assert(res);
			return pc.link(u, u2.getId());
		}).then(function (res) {
			assert(res);
			return pc.isLinkedToObject(u, null);
		}).then(function (res) {
			assert(!res);
			return pc.isLinkedToObject(u, t);
		}).then(function (res) {
			assert(res);
			return pc.isLinkedToObject(u, u2);
		}).then(function (res) {
			assert(res);
			return sleep(1);
		}).then(function (res) {
			return pc.getLinkedObjects(u, "tag");
		}).then(function (res) {
			assert.strictEqual(1, res.length);
			return pc.getLinkedObjects(u, "sysprop");
		}).then(function (res) {
			assert.strictEqual(1, res.length);
			return pc.countLinks(u, null);
		}).then(function (res) {
			assert.strictEqual(0, res);
			return pc.countLinks(u, "tag");
		}).then(function (res) {
			assert.strictEqual(1, res);
			return pc.countLinks(u, "sysprop");
		}).then(function (res) {
			assert.strictEqual(1, res);
			return pc.unlinkAll(u);
		}).then(function (res) {
			return pc.isLinkedToObject(u, t);
		}).then(function (res) {
			assert.strictEqual(res, false);
			return pc.isLinkedToObject(u, u2);
		}).then(function (res) {
			assert(!res);
			done();
		}).catch(function (err) {
			done(err);
		});
	});

	it('should pass util tests', function (done) {
		var id1;
		var id2;
		pc.newId().then(function (res) {
			id1 = res;
			assert(id1 && id1.length > 0);
			return pc.newId();
		}).then(function (res) {
			id2 = res;
			assert.notEqual(id1, id2);
			return pc.getTimestamp();
		}).then(function (res) {
			assert(res);
			assert(res > 0);
			return pc.formatDate("M d yyyy", "US");
		}).then(function (res) {
			var d = new Date();
			var date2 = (d.getMonth() + 1) + " " + d.getDate() + " " + d.getFullYear();
			assert.strictEqual(res, date2);
			return pc.noSpaces(" test  123		test ", "");
		}).then(function (res) {
			assert.strictEqual(res, "test123test");
			return pc.stripAndTrim(" %^&*( cool )		@!");
		}).then(function (res) {
			assert.strictEqual(res, "cool");
			return pc.markdownToHtml("#hello **test**");
		}).then(function (res) {
			assert.strictEqual(res, "<h1>hello <strong>test</strong></h1>\n");
			return pc.approximately(15000);
		}).then(function (res) {
			assert.strictEqual(res, "15s");
			done();
		}).catch(function (err) {
			done(err);
		});
	});

	it('should pass misc tests', function (done) {
		var types;
		pc.types().then(function (res) {
			assert(res !== null);
			types = res;
			assert(!_.isEmpty(types));
			assert(types["users"]);
			return pc.me();
		}).then(function (res) {
			assert(res !== null);
			assert.strictEqual("app:para", res.getId());
			done();
		}).catch(function (err) {
			done(err);
		});
	});

	it('should pass validations tests', function (done) {
		var kittenType = "kitten";
		var ct;

		pc.validationConstraints().then(function (res) {
			assert(!_.isEmpty(res));
			assert(res["app"]);
			assert(res["user"]);
			return pc.validationConstraints("app");
		}).then(function (res) {
			assert(!_.isEmpty(res));
			assert(res["app"]);
			assert.strictEqual(1, _.size(res));
			return pc.addValidationConstraint(kittenType, "paws", Constraint.required());
		}).then(function (res) {
			return pc.validationConstraints(kittenType);
		}).then(function (res) {
			var t = kittenType[0] + kittenType.slice(1);
			assert(res[t]["paws"]);
			ct = new ParaObject("felix");
			ct.setType(kittenType);
			// validation fails
			return pc.create(ct).then(function (res) {
				assert(false);
			}, function (err) {
				assert(true);
			});
		}).then(function (res) {
			ct.paws = "4";
			return pc.create(ct);
		}).then(function (res) {
			assert(res);
			return pc.removeValidationConstraint(kittenType, "paws", "required");
		}).then(function (res) {
			return pc.validationConstraints(kittenType);
		}).then(function (res) {
			var t = kittenType[0] + kittenType.slice(1);
			assert(!res[t]);
			done();
		}).catch(function (err) {
			done(err);
		});
	});

	it('should pass permissions tests', function (done) {
		// Permissions
		pc.resourcePermissions().then(function (res) {
			assert(res !== null);
			return pc.grantResourcePermission(null, dogsType, []);
		}).then(function (res) {
			assert(res && _.isEmpty(res));
			return pc.grantResourcePermission(" ", "", []);
		}).then(function (res) {
			assert(res && _.isEmpty(res));
			return pc.grantResourcePermission(u1.getId(), dogsType, ["GET"]);
		}).then(function (res) {
			return pc.resourcePermissions(u1.getId());
		}).then(function (res) {
			var permits = res;
			assert(permits[u1.getId()] !== null);
			assert(permits[u1.getId()][dogsType] !== null);
			return pc.isAllowedTo(u1.getId(), dogsType, "GET");
		}).then(function (res) {
			assert(res);
			return pc.isAllowedTo(u1.getId(), dogsType, "POST");
		}).then(function (res) {
			assert(!res);
			return pc.resourcePermissions();
		}).then(function (res) {
			var permits = res;
			assert(permits[u1.getId()] !== null);
			assert(permits[u1.getId()][dogsType] !== null);
			return pc.revokeResourcePermission(u1.getId(), dogsType);
		}).then(function (res) {
			return pc.resourcePermissions(u1.getId());
		}).then(function (res) {
			var permits = res;
			assert(!permits[u1.getId()][dogsType]);
			return pc.isAllowedTo(u1.getId(), dogsType, "GET");
		}).then(function (res) {
			assert(!res);
			return pc.isAllowedTo(u1.getId(), dogsType, "POST");
		}).then(function (res) {
			assert(!res);
			return pc.grantResourcePermission(u2.getId(), "*", ["POST", "PUT", "PATCH", "DELETE"]);
		}).then(function (res) {
			assert(res);
			return pc.isAllowedTo(u2.getId(), dogsType, "PUT");
		}).then(function (res) {
			assert(res);
			return pc.isAllowedTo(u2.getId(), dogsType, "PATCH");
		}).then(function (res) {
			assert(res);
			return pc.revokeAllResourcePermissions(u2.getId());
		}).then(function (res) {
			return pc.resourcePermissions();
		}).then(function (res) {
			var permits = res;
			assert(!permits[u2.getId()] || _.isEmpty(permits[u2.getId()]));
			return pc.isAllowedTo(u2.getId(), dogsType, "PUT");
		}).then(function (res) {
			assert(!res[u2.getId()]);
			return pc.grantResourcePermission(u1.getId(), dogsType, ["POST", "PUT", "PATCH", "DELETE"]);
		}).then(function (res) {
			return pc.grantResourcePermission("*", catsType, ["POST", "PUT", "PATCH", "DELETE"]);
		}).then(function (res) {
			return pc.grantResourcePermission("*", "*", ["GET"]);
		}).then(function (res) {
			// user-specific permissions are in effect
			return pc.isAllowedTo(u1.getId(), dogsType, "PUT");
		}).then(function (res) {
			assert(res);
			return pc.isAllowedTo(u1.getId(), dogsType, "GET");
		}).then(function (res) {
			assert(!res);
			return pc.isAllowedTo(u1.getId(), catsType, "PUT");
		}).then(function (res) {
			assert(res);
			return pc.isAllowedTo(u1.getId(), catsType, "GET");
		}).then(function (res) {
			assert(res);
			return pc.revokeAllResourcePermissions(u1.getId());
		}).then(function (res) {
			// user-specific permissions not found so check wildcard
			return pc.isAllowedTo(u1.getId(), dogsType, "PUT");
		}).then(function (res) {
			assert(!res);
			return pc.isAllowedTo(u1.getId(), dogsType, "GET");
		}).then(function (res) {
			assert(res);
			return pc.isAllowedTo(u1.getId(), catsType, "PUT");
		}).then(function (res) {
			assert(res);
			return pc.isAllowedTo(u1.getId(), catsType, "GET");
		}).then(function (res) {
			assert(res);
			return pc.revokeResourcePermission("*", catsType);
		}).then(function (res) {
			// resource-specific permissions not found so check wildcard
			return pc.isAllowedTo(u1.getId(), dogsType, "PUT");
		}).then(function (res) {
			assert(!res);
			return pc.isAllowedTo(u1.getId(), catsType, "PUT");
		}).then(function (res) {
			assert(!res);
			return pc.isAllowedTo(u1.getId(), dogsType, "GET");
		}).then(function (res) {
			assert(res);
			return pc.isAllowedTo(u1.getId(), catsType, "GET");
		}).then(function (res) {
			assert(res);
			return pc.isAllowedTo(u2.getId(), dogsType, "GET");
		}).then(function (res) {
			assert(res);
			return pc.isAllowedTo(u2.getId(), catsType, "GET");
		}).then(function (res) {
			assert(res);
			return pc.revokeAllResourcePermissions("*");
		}).then(function (res) {
			return pc.revokeAllResourcePermissions(u1.getId());
		}).then(function (res) {
			done();
		}).catch(function (err) {
			done(err);
		});
	});

	it('should pass tokens tests', function (done) {
		assert(pc.getAccessToken() === null);
		pc.signIn("facebook", "test_token").then(function (res) {
			assert(!res);
			return pc.revokeAllTokens();
		}).then(function (res) {
			assert(!res);
			return done();
		});
	});
});

function sleep (sec) {
	return new RSVP.Promise(function (resolve, reject) {
		setTimeout(function () {
			resolve(true);
		}, sec * 1000);
	});
}

Moksi.describe('Moksi.Expectations.Collection', {
  'captures and flushes expectation results': function() {
    var collection = new Moksi.Expectations.Collection();
    
    collection.capture('ok');
    var results = collection.flush();
    expects(results.length).equals(1);
    expects(results[0].result).equals('ok');
    
    collection.capture('not ok', 'things I expect should be the case');
    var results = collection.flush();
    expects(results.length).equals(1);
    expects(results[0].result).equals('not ok');
    expects(results[0].message).equals('things I expect should be the case');
    
    expects(collection.results).empty();
  },
  
  'reports success when there are no expectations': function() {
    var collection = new Moksi.Expectations.Collection();
    var report = collection.report();
    expects(report.result).equals('ok');
  },
  
  'reports success when all expectations fail': function() {
    var collection = new Moksi.Expectations.Collection();
    collection.capture('not ok', 'something is not ok');
    collection.capture('not ok', 'something else is also bad');
    
    var report = collection.report();
    expects(report.result).equals('not ok');
  },
  
  'reports failure when one expectation fails': function() {
    var collection = new Moksi.Expectations.Collection();
    collection.capture('ok');
    collection.capture('not ok', 'something is not ok');
    
    var report = collection.report();
    expects(report.result).equals('not ok');
  },
  
  'reports expectation messages': function() {
    var collection = new Moksi.Expectations.Collection();
    collection.capture('ok');
    collection.capture('not ok', 'something is not ok');
    collection.capture('not ok', 'something else is also bad');
    
    var report = collection.report();
    expects(report.messages).equalsArray(['something is not ok', 'something else is also bad']);
  },
  
  'reports the correct expectation count': function() {
    var collection = new Moksi.Expectations.Collection();
    
    expects(collection.report().expectationCount).equals(0);
    
    collection.capture('ok');
    expects(collection.report().expectationCount).equals(1);
    
    collection.capture('ok');
    collection.capture('ok');
    expects(collection.report().expectationCount).equals(2);
  }
});

var Fake = {};
Fake.Collection = {
  captured: [],
  capture: function(result) {
    Fake.Collection.captured.push(result);
  }
}

var BaseTestSuite = {
  setup: function() {
    Fake.Collection.captured = [];
  },
  
  helpers: {
    expectAssertionsRun: function(options) {
      options.examples.each(function(example) {
        var subject = new Moksi.Expectations.Subject(example[0], Fake.Collection, {result: options.asserting});
        subject.equals(example[1]);
      }, this);
      
      expects(Fake.Collection.captured.length).equals(options.examples.length);
      expects(Fake.Collection.captured.all(function(element) {
        return element == options.withResult;
      })).truthy();
    }
  }
}

Moksi.describe('Moksi.Expectations.Subject, concerning equals', Object.extend(BaseTestSuite, {
  'reports success for successful expected tests': function() {
    // For example expects(1).equals(1) should succeed
    expectAssertionsRun({
      examples:   [[1, 1], [2, 2], ['ok', 'ok'], [2.0, 2.0]],
      asserting:  true,
      withResult: 'ok'
    });
  },
  
  'reports failure for failed expected tests': function() {
    // For example expects(1).equals(2) should fail
    expectAssertionsRun({
      examples:   [[1, 2], [2, 1], ['ok', 'not ok'], [2.0, 2.1]],
      asserting:  true,
      withResult: 'not ok'
    });
  },
  
  'reports success for successful rejected tests': function() {
    // For example rejects(1).equals(2) should succeed
    expectAssertionsRun({
      examples:   [[1, 2], [2, 1], ['ok', 'not ok'], [2.0, 2.1]],
      asserting:  false,
      withResult: 'ok'
    });
  },
  
  'reports failure for failed rejected tests': function() {
    // For example rejects(1).equals(1) should fail
    expectAssertionsRun({
      examples:   [[1, 1], [2, 2], ['ok', 'ok'], [2.0, 2.0]],
      asserting:  false,
      withResult: 'not ok'
    });
  }
}));

Moksi.describe('Moksi.Expectations.Subject, concerning other assertions', {
  setup: function() {
    Fake.Collection.captured = [];
  },
  
  'reports success for successful not null tests': function() {
    var examples = [1, 0, 'a', false, true];
    
    examples.each(function(example) {
      var subject = new Moksi.Expectations.Subject(example, Fake.Collection, {result: true});
      subject.notNull();
    }, this);
    
    expects(Fake.Collection.captured.length).equals(examples.length);
    expects(Fake.Collection.captured.all(function(element) {
      return element == 'ok';
    })).truthy();
  },
  
  'reports failure for failed not null tests': function() {
    var subject = new Moksi.Expectations.Subject(null, Fake.Collection, {result: true});
    subject.notNull();
    
    expects(Fake.Collection.captured.length).equals(1);
    expects(Fake.Collection.captured.first()).equals('not ok');
  }
});
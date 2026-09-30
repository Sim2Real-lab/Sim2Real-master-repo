import sys

# Python 3.14 compatibility patch for Django's BaseContext.__copy__
if sys.version_info >= (3, 14):
    try:
        from django.template import context as django_context

        def _base_context_copy(self):
            duplicate = object.__new__(self.__class__)
            duplicate.__dict__.update(self.__dict__)
            if hasattr(self, 'dicts'):
                duplicate.dicts = self.dicts[:]
            return duplicate

        django_context.BaseContext.__copy__ = _base_context_copy
    except ImportError:
        pass

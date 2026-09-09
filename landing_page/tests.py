from django.test import SimpleTestCase
from django.urls import reverse


class LegalPageTests(SimpleTestCase):
    def test_privacy_policy_is_public(self):
        response = self.client.get(reverse('landing_page:privacy_policy'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Privacy Policy')
        self.assertContains(response, 'Information we collect')

    def test_terms_and_conditions_are_public(self):
        response = self.client.get(reverse('landing_page:terms_and_conditions'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Terms &amp; Conditions', html=True)
        self.assertContains(response, 'Competition participation')

    def test_home_page_footer_links_to_legal_pages(self):
        response = self.client.get(reverse('landing_page:main_landing_page'))

        self.assertContains(response, reverse('landing_page:privacy_policy'))
        self.assertContains(response, reverse('landing_page:terms_and_conditions'))

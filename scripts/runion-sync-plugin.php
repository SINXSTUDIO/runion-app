<?php
/**
 * Plugin Name: RUNION Sync Plugin
 * Plugin URI: https://runion.eu
 * Description: Csendes adatszinkronizációs és migrációs bővítmény a RUNION WordPress és az új Next.js webalkalmazás között.
 * Version: 1.0.0
 * Author: RUNION Dev Team
 * License: GPLv2 or later
 */

if (!defined('ABSPATH')) {
    exit;
}

final class Runion_Data_Sync_Plugin {

    public function __construct() {
        add_action('admin_menu', array($this, 'register_admin_menu'));
        add_action('admin_init', array($this, 'register_plugin_settings'));
        
        // Hooks for live submission intercept
        add_action('wpcf7_mail_sent', array($this, 'on_cf7_sent'));
        add_action('flamingo_inbound_after_save', array($this, 'on_flamingo_saved'));
        add_action('woocommerce_checkout_order_processed', array($this, 'on_wc_checkout'));
    }

    public function register_admin_menu() {
        add_menu_page(
            'RUNION Sync',
            'RUNION Sync',
            'manage_options',
            'runion-data-sync',
            array($this, 'render_options_page'),
            'dashicons-cloud-upload',
            30
        );
    }

    public function register_plugin_settings() {
        register_setting('runion_sync_group', 'runion_target_webhook_url');
        register_setting('runion_sync_group', 'runion_target_sync_secret');
    }

    public function render_options_page() {
        if (!current_user_can('manage_options')) {
            return;
        }

        $message = '';
        if (isset($_POST['runion_action_bulk_flamingo']) && check_admin_referer('runion_bulk_sync_nonce')) {
            $count = $this->process_bulk_flamingo_sync();
            $message = 'Sikeresen átküldve ' . intval($count) . ' Flamingo bejegyzés a Next.js-nek!';
        }

        if (isset($_POST['runion_action_bulk_wc']) && check_admin_referer('runion_bulk_sync_nonce')) {
            $count = $this->process_bulk_wc_sync();
            $message = 'Sikeresen átküldve ' . intval($count) . ' WooCommerce rendelés a Next.js-nek!';
        }

        $webhook_url = get_option('runion_target_webhook_url', 'https://runion-app.vercel.app/api/webhooks/wordpress');
        $sync_secret = get_option('runion_target_sync_secret', 'runion_wp_sync_secret_key_2026');
        ?>
        <div class="wrap">
            <h1>RUNION Adatszinkronizáció & Migráció</h1>
            <p>Ez a bővítmény csendben, a háttérben szinkronizálja a beérkező Flamingo és WooCommerce nevezéseket az új RUNION webalkalmazással.</p>

            <?php if (!empty($message)) : ?>
                <div class="notice notice-success is-dismissible"><p><strong><?php echo esc_html($message); ?></strong></p></div>
            <?php endif; ?>

            <form method="post" action="options.php">
                <?php settings_fields('runion_sync_group'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="runion_target_webhook_url">Next.js Webhook URL</label></th>
                        <td>
                            <input type="url" id="runion_target_webhook_url" name="runion_target_webhook_url" value="<?php echo esc_url($webhook_url); ?>" class="regular-text" style="width: 100%; max-width: 600px;" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="runion_target_sync_secret">Titkos Szinkronizációs Kulcs</label></th>
                        <td>
                            <input type="password" id="runion_target_sync_secret" name="runion_target_sync_secret" value="<?php echo esc_attr($sync_secret); ?>" class="regular-text" style="width: 100%; max-width: 600px;" />
                        </td>
                    </tr>
                </table>
                <?php submit_button('Beállítások Mentése'); ?>
            </form>

            <hr style="margin: 30px 0;" />

            <h2>Történeti Adatok Tömeges Migrálása</h2>
            <p>Az alábbi gombokkal az összes eddigi Flamingo űrlapbejegyzést és WooCommerce megrendelést áttöltheted a Supabase adatbázisba.</p>

            <form method="post" action="" style="margin-top: 20px; display: flex; gap: 15px;">
                <?php wp_nonce_field('runion_bulk_sync_nonce'); ?>
                <button type="submit" name="runion_action_bulk_flamingo" value="1" class="button button-primary button-large">
                    🦩 Összes Flamingo Nevezés Áthozása
                </button>
                <button type="submit" name="runion_action_bulk_wc" value="1" class="button button-secondary button-large">
                    🛒 Összes WooCommerce Rendelés Áthozása
                </button>
            </form>
        </div>
        <?php
    }

    private function post_to_nextjs_api($payload) {
        $webhook_url = get_option('runion_target_webhook_url', 'https://runion-app.vercel.app/api/webhooks/wordpress');
        $sync_secret = get_option('runion_target_sync_secret', 'runion_wp_sync_secret_key_2026');

        $args = array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'x-wp-sync-secret' => $sync_secret,
            ),
            'body' => wp_json_encode($payload),
            'timeout' => 20,
        );

        return wp_remote_post($webhook_url, $args);
    }

    public function on_cf7_sent($contact_form) {
        if (!class_exists('WPCF7_Submission')) return;
        $submission = WPCF7_Submission::get_instance();
        if (!$submission) return;

        $data = $submission->get_posted_data();
        $payload = array(
            'email' => isset($data['your-email']) ? sanitize_email($data['your-email']) : '',
            'firstName' => isset($data['first-name']) ? sanitize_text_field($data['first-name']) : '',
            'lastName' => isset($data['last-name']) ? sanitize_text_field($data['last-name']) : '',
            'phoneNumber' => isset($data['your-phone']) ? sanitize_text_field($data['your-phone']) : '',
            'birthDate' => isset($data['birth-date']) ? sanitize_text_field($data['birth-date']) : '',
            'gender' => isset($data['gender']) ? sanitize_text_field($data['gender']) : '',
            'clubName' => isset($data['club']) ? sanitize_text_field($data['club']) : '',
            'tshirtSize' => isset($data['tshirt']) ? sanitize_text_field($data['tshirt']) : '',
            'city' => isset($data['city']) ? sanitize_text_field($data['city']) : '',
            'zipCode' => isset($data['zip']) ? sanitize_text_field($data['zip']) : '',
            'address' => isset($data['address']) ? sanitize_text_field($data['address']) : '',
            'eventName' => is_object($contact_form) && method_exists($contact_form, 'title') ? $contact_form->title() : 'Form Nevezés',
            'distanceName' => isset($data['distance']) ? sanitize_text_field($data['distance']) : 'Alap táv',
            'paymentStatus' => 'PAID',
        );

        $this->post_to_nextjs_api($payload);
    }

    public function on_flamingo_saved($inbound) {
        if (!$inbound || !isset($inbound->fields)) return;
        $fields = $inbound->fields;
        $payload = array(
            'email' => isset($fields['your-email']) ? sanitize_email($fields['your-email']) : '',
            'firstName' => isset($fields['your-name']) ? sanitize_text_field($fields['your-name']) : '',
            'eventName' => isset($inbound->subject) ? sanitize_text_field($inbound->subject) : 'Flamingo Nevezés',
            'paymentStatus' => 'PAID',
        );
        $this->post_to_nextjs_api($payload);
    }

    public function on_wc_checkout($order_id) {
        if (!function_exists('wc_get_order')) return;
        $order = wc_get_order($order_id);
        if (!$order) return;

        $payload = array(
            'email' => sanitize_email($order->get_billing_email()),
            'firstName' => sanitize_text_field($order->get_billing_first_name()),
            'lastName' => sanitize_text_field($order->get_billing_last_name()),
            'phoneNumber' => sanitize_text_field($order->get_billing_phone()),
            'city' => sanitize_text_field($order->get_billing_city()),
            'zipCode' => sanitize_text_field($order->get_billing_postcode()),
            'address' => sanitize_text_field($order->get_billing_address_1()),
            'eventName' => 'WooCommerce Rendelés #' . $order_id,
            'pricePaid' => $order->get_total(),
            'paymentStatus' => $order->is_paid() ? 'PAID' : 'PENDING',
        );
        $this->post_to_nextjs_api($payload);
    }

    public function process_bulk_flamingo_sync() {
        $posts = get_posts(array(
            'post_type' => 'flamingo_inbound',
            'posts_per_page' => 5000,
            'post_status' => 'any',
        ));

        $payloads = array();
        foreach ($posts as $post) {
            $fields = get_post_meta($post->ID, '_fields', true);
            if (!is_array($fields)) continue;

            $payloads[] = array(
                'email' => isset($fields['your-email']) ? sanitize_email($fields['your-email']) : (isset($fields['email']) ? sanitize_email($fields['email']) : ''),
                'firstName' => isset($fields['your-name']) ? sanitize_text_field($fields['your-name']) : (isset($fields['keresztnev']) ? sanitize_text_field($fields['keresztnev']) : ''),
                'lastName' => isset($fields['vezeteknev']) ? sanitize_text_field($fields['vezeteknev']) : '',
                'phoneNumber' => isset($fields['telefon']) ? sanitize_text_field($fields['telefon']) : '',
                'birthDate' => isset($fields['szuletesi_datum']) ? sanitize_text_field($fields['szuletesi_datum']) : '',
                'gender' => isset($fields['nem']) ? sanitize_text_field($fields['nem']) : '',
                'clubName' => isset($fields['egyesulet']) ? sanitize_text_field($fields['egyesulet']) : '',
                'tshirtSize' => isset($fields['polomeret']) ? sanitize_text_field($fields['polomeret']) : '',
                'city' => isset($fields['varos']) ? sanitize_text_field($fields['varos']) : '',
                'zipCode' => isset($fields['iranyitoszam']) ? sanitize_text_field($fields['iranyitoszam']) : '',
                'address' => isset($fields['cim']) ? sanitize_text_field($fields['cim']) : '',
                'eventName' => sanitize_text_field($post->post_title),
                'distanceName' => isset($fields['tav']) ? sanitize_text_field($fields['tav']) : 'Alap táv',
                'paymentStatus' => 'PAID',
            );
        }

        if (!empty($payloads)) {
            $this->post_to_nextjs_api($payloads);
        }

        return count($payloads);
    }

    public function process_bulk_wc_sync() {
        if (!function_exists('wc_get_orders')) return 0;
        $orders = wc_get_orders(array('limit' => 500));
        $payloads = array();

        foreach ($orders as $order) {
            $payloads[] = array(
                'email' => sanitize_email($order->get_billing_email()),
                'firstName' => sanitize_text_field($order->get_billing_first_name()),
                'lastName' => sanitize_text_field($order->get_billing_last_name()),
                'phoneNumber' => sanitize_text_field($order->get_billing_phone()),
                'city' => sanitize_text_field($order->get_billing_city()),
                'zipCode' => sanitize_text_field($order->get_billing_postcode()),
                'address' => sanitize_text_field($order->get_billing_address_1()),
                'eventName' => 'WooCommerce Rendelés #' . $order->get_id(),
                'pricePaid' => $order->get_total(),
                'paymentStatus' => $order->is_paid() ? 'PAID' : 'PENDING',
            );
        }

        if (!empty($payloads)) {
            $this->post_to_nextjs_api($payloads);
        }

        return count($payloads);
    }
}

new Runion_Data_Sync_Plugin();

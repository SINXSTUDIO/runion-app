<?php
/**
 * Plugin Name: RUNION Sync Plugin
 * Plugin URI: https://runion.eu
 * Description: Csendes adatszinkronizációs és migrációs bővítmény a RUNION WordPress és az új Next.js webalkalmazás között (Flamingo, Contact Form 7, WooCommerce support).
 * Version: 1.0.0
 * Author: RUNION Dev Team
 * Text Domain: runion-sync
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class RunionSyncPlugin {
    private static $instance = null;

    public static function get_instance() {
        if (self::$instance == null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        
        // Hooks for live submission intercept
        add_action('wpcf7_mail_sent', array($this, 'handle_cf7_submission'));
        add_action('flamingo_inbound_after_save', array($this, 'handle_flamingo_submission'));
        add_action('woocommerce_checkout_order_processed', array($this, 'handle_wc_order'));

        // AJAX handlers for bulk sync
        add_action('wp_ajax_runion_bulk_sync_flamingo', array($this, 'bulk_sync_flamingo'));
        add_action('wp_ajax_runion_bulk_sync_wc', array($this, 'bulk_sync_wc'));
    }

    public function add_admin_menu() {
        add_menu_page(
            'RUNION Sync',
            'RUNION Sync',
            'manage_options',
            'runion-sync',
            array($this, 'render_admin_page'),
            'dashicons-update',
            30
        );
    }

    public function register_settings() {
        register_setting('runion_sync_options', 'runion_webhook_url');
        register_setting('runion_sync_options', 'runion_sync_secret');
    }

    public function render_admin_page() {
        $webhook_url = get_option('runion_webhook_url', 'https://runion-app.vercel.app/api/webhooks/wordpress');
        $sync_secret = get_option('runion_sync_secret', 'runion_wp_sync_secret_key_2026');
        ?>
        <div class="wrap">
            <h1>RUNION Adatszinkronizáció & Migráció</h1>
            <p>Ez a bővítmény csendben, a háttérben szinkronizálja a beérkező Flamingo és WooCommerce nevezéseket az új RUNION webalkalmazással.</p>
            
            <form method="post" action="options.php">
                <?php settings_fields('runion_sync_options'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row">Next.js Webhook URL</th>
                        <td>
                            <input type="url" name="runion_webhook_url" value="<?php echo esc_attr($webhook_url); ?>" class="regular-text" style="width: 100%; max-width: 600px;" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Titkos Szinkronizációs Kulcs (Secret)</th>
                        <td>
                            <input type="password" name="runion_sync_secret" value="<?php echo esc_attr($sync_secret); ?>" class="regular-text" style="width: 100%; max-width: 600px;" />
                        </td>
                    </tr>
                </table>
                <?php submit_button('Beállítások Mentése'); ?>
            </form>

            <hr style="margin: 30px 0;" />

            <h2>Történeti Adatok Tömeges Migrálása (Bulk Migration)</h2>
            <p>Az alábbi gombokkal az összes eddigi Flamingo űrlapbejegyzést és WooCommerce megrendelést áttöltheted a Supabase adatbázisba.</p>

            <div style="margin-top: 20px; display: flex; gap: 15px;">
                <button type="button" id="btn-sync-flamingo" class="button button-primary button-large">
                    🦩 Összes Flamingo Nevezés Áthozása
                </button>
                <button type="button" id="btn-sync-wc" class="button button-secondary button-large">
                    🛒 Összes WooCommerce Rendelés Áthozása
                </button>
            </div>

            <div id="sync-status" style="margin-top: 20px; padding: 15px; background: #fff; border: 1px solid #ccc; display: none;"></div>
        </div>

        <script>
        jQuery(document).ready(function($) {
            $('#btn-sync-flamingo').on('click', function() {
                var $btn = $(this);
                $btn.prop('disabled', true).text('Migrálás folyamatban (Flamingo)...');
                $('#sync-status').show().html('<b>Flamingo adatok gyűjtése és küldése...</b>');

                $.post(ajaxurl, { action: 'runion_bulk_sync_flamingo' }, function(response) {
                    $btn.prop('disabled', false).text('🦩 Összes Flamingo Nevezés Áthozása');
                    if (response.success) {
                        $('#sync-status').html('<span style="color: green; font-weight: bold;">Sikeres Flamingo migrálás! ' + response.data.message + '</span>');
                    } else {
                        $('#sync-status').html('<span style="color: red; font-weight: bold;">Hiba történt: ' + (response.data || 'Ismeretlen hiba') + '</span>');
                    }
                });
            });

            $('#btn-sync-wc').on('click', function() {
                var $btn = $(this);
                $btn.prop('disabled', true).text('Migrálás folyamatban (WooCommerce)...');
                $('#sync-status').show().html('<b>WooCommerce rendelések gyűjtése és küldése...</b>');

                $.post(ajaxurl, { action: 'runion_bulk_sync_wc' }, function(response) {
                    $btn.prop('disabled', false).text('🛒 Összes WooCommerce Rendelés Áthozása');
                    if (response.success) {
                        $('#sync-status').html('<span style="color: green; font-weight: bold;">Sikeres WooCommerce migrálás! ' + response.data.message + '</span>');
                    } else {
                        $('#sync-status').html('<span style="color: red; font-weight: bold;">Hiba történt: ' + (response.data || 'Ismeretlen hiba') + '</span>');
                    }
                });
            });
        });
        </script>
        <?php
    }

    public function send_payload_to_nextjs($payload) {
        $webhook_url = get_option('runion_webhook_url', 'https://runion-app.vercel.app/api/webhooks/wordpress');
        $sync_secret = get_option('runion_sync_secret', 'runion_wp_sync_secret_key_2026');

        $response = wp_remote_post($webhook_url, array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'x-wp-sync-secret' => $sync_secret,
            ),
            'body' => json_encode($payload),
            'timeout' => 15,
        ));

        return $response;
    }

    public function handle_cf7_submission($contact_form) {
        $submission = WPCF7_Submission::get_instance();
        if ($submission) {
            $data = $submission->get_posted_data();
            $payload = array(
                'email' => isset($data['your-email']) ? $data['your-email'] : (isset($data['email']) ? $data['email'] : ''),
                'firstName' => isset($data['first-name']) ? $data['first-name'] : (isset($data['keresztnev']) ? $data['keresztnev'] : ''),
                'lastName' => isset($data['last-name']) ? $data['last-name'] : (isset($data['vezeteknev']) ? $data['vezeteknev'] : ''),
                'phoneNumber' => isset($data['your-phone']) ? $data['your-phone'] : (isset($data['telefon']) ? $data['telefon'] : ''),
                'birthDate' => isset($data['birth-date']) ? $data['birth-date'] : (isset($data['szuletesi_datum']) ? $data['szuletesi_datum'] : ''),
                'gender' => isset($data['gender']) ? $data['gender'] : (isset($data['nem']) ? $data['nem'] : ''),
                'clubName' => isset($data['club']) ? $data['club'] : (isset($data['egyesulet']) ? $data['egyesulet'] : ''),
                'tshirtSize' => isset($data['tshirt']) ? $data['tshirt'] : (isset($data['polomeret']) ? $data['polomeret'] : ''),
                'city' => isset($data['city']) ? $data['city'] : (isset($data['varos']) ? $data['varos'] : ''),
                'zipCode' => isset($data['zip']) ? $data['zip'] : (isset($data['iranyitoszam']) ? $data['iranyitoszam'] : ''),
                'address' => isset($data['address']) ? $data['address'] : (isset($data['cim']) ? $data['cim'] : ''),
                'emergencyContactName' => isset($data['emergency-name']) ? $data['emergency-name'] : '',
                'emergencyContactPhone' => isset($data['emergency-phone']) ? $data['emergency-phone'] : '',
                'eventName' => $contact_form->title(),
                'distanceName' => isset($data['distance']) ? $data['distance'] : (isset($data['tav']) ? $data['tav'] : 'Alap táv'),
                'paymentStatus' => 'PAID',
            );
            $this->send_payload_to_nextjs($payload);
        }
    }

    public function handle_flamingo_submission($inbound) {
        if (!$inbound) return;
        $fields = $inbound->fields;
        $payload = array(
            'email' => isset($fields['your-email']) ? $fields['your-email'] : '',
            'firstName' => isset($fields['your-name']) ? $fields['your-name'] : '',
            'eventName' => $inbound->subject,
            'paymentStatus' => 'PAID',
        );
        $this->send_payload_to_nextjs($payload);
    }

    public function handle_wc_order($order_id) {
        $order = wc_get_order($order_id);
        if (!$order) return;

        $payload = array(
            'email' => $order->get_billing_email(),
            'firstName' => $order->get_billing_first_name(),
            'lastName' => $order->get_billing_last_name(),
            'phoneNumber' => $order->get_billing_phone(),
            'city' => $order->get_billing_city(),
            'zipCode' => $order->get_billing_postcode(),
            'address' => $order->get_billing_address_1(),
            'eventName' => 'WooCommerce Rendelés #' . $order_id,
            'pricePaid' => $order->get_total(),
            'paymentStatus' => $order->is_paid() ? 'PAID' : 'PENDING',
        );
        $this->send_payload_to_nextjs($payload);
    }

    public function bulk_sync_flamingo() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Jogosultsági hiba.');
        }

        $args = array(
            'post_type' => 'flamingo_inbound',
            'posts_per_page' => 500,
            'post_status' => 'publish',
        );

        $posts = get_posts($args);
        $payloads = array();

        foreach ($posts as $post) {
            $fields = get_post_meta($post->ID, '_fields', true);
            if (!is_array($fields)) continue;

            $payloads[] = array(
                'email' => isset($fields['your-email']) ? $fields['your-email'] : (isset($fields['email']) ? $fields['email'] : ''),
                'firstName' => isset($fields['your-name']) ? $fields['your-name'] : (isset($fields['keresztnev']) ? $fields['keresztnev'] : ''),
                'lastName' => isset($fields['vezeteknev']) ? $fields['vezeteknev'] : '',
                'phoneNumber' => isset($fields['telefon']) ? $fields['telefon'] : '',
                'birthDate' => isset($fields['szuletesi_datum']) ? $fields['szuletesi_datum'] : '',
                'gender' => isset($fields['nem']) ? $fields['nem'] : '',
                'clubName' => isset($fields['egyesulet']) ? $fields['egyesulet'] : '',
                'tshirtSize' => isset($fields['polomeret']) ? $fields['polomeret'] : '',
                'city' => isset($fields['varos']) ? $fields['varos'] : '',
                'zipCode' => isset($fields['iranyitoszam']) ? $fields['iranyitoszam'] : '',
                'address' => isset($fields['cim']) ? $fields['cim'] : '',
                'emergencyContactName' => isset($fields['surgossegi_nev']) ? $fields['surgossegi_nev'] : '',
                'emergencyContactPhone' => isset($fields['surgossegi_telefon']) ? $fields['surgossegi_telefon'] : '',
                'eventName' => $post->post_title,
                'distanceName' => isset($fields['tav']) ? $fields['tav'] : 'Alap táv',
                'paymentStatus' => 'PAID',
            );
        }

        if (empty($payloads)) {
            wp_send_json_success(array('message' => 'Nincs Flamingo bejegyzés a rendszerben.'));
        }

        $res = $this->send_payload_to_nextjs($payloads);
        if (is_wp_error($res)) {
            wp_send_json_error($res->get_error_message());
        }

        wp_send_json_success(array('message' => count($payloads) . ' Flamingo bejegyzés elküldve a Next.js-nek!'));
    }

    public function bulk_sync_wc() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Jogosultsági hiba.');
        }

        if (!function_exists('wc_get_orders')) {
            wp_send_json_error('A WooCommerce bővítmény nem aktív.');
        }

        $orders = wc_get_orders(array('limit' => 500));
        $payloads = array();

        foreach ($orders as $order) {
            $payloads[] = array(
                'email' => $order->get_billing_email(),
                'firstName' => $order->get_billing_first_name(),
                'lastName' => $order->get_billing_last_name(),
                'phoneNumber' => $order->get_billing_phone(),
                'city' => $order->get_billing_city(),
                'zipCode' => $order->get_billing_postcode(),
                'address' => $order->get_billing_address_1(),
                'eventName' => 'WooCommerce Rendelés #' . $order->get_id(),
                'pricePaid' => $order->get_total(),
                'paymentStatus' => $order->is_paid() ? 'PAID' : 'PENDING',
            );
        }

        if (empty($payloads)) {
            wp_send_json_success(array('message' => 'Nincs WooCommerce rendelés.'));
        }

        $res = $this->send_payload_to_nextjs($payloads);
        if (is_wp_error($res)) {
            wp_send_json_error($res->get_error_message());
        }

        wp_send_json_success(array('message' => count($payloads) . ' WooCommerce rendelés elküldve a Next.js-nek!'));
    }
}

RunionSyncPlugin::get_instance();
